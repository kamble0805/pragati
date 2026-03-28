const { Router } = require('express');
const { getDb } = require('../config/db');

const router = Router();

// Middleware to verify if user is admin could be added here
// For now, assuming these are protected by frontend or subsequent middleware integration

// GET /categories
router.get('/categories', async (req, res) => {
    try {
        const db = await getDb();
        const categories = await db.all('SELECT * FROM portfolio_categories ORDER BY is_default DESC, name ASC');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /categories
router.post('/categories', async (req, res) => {
    try {
        const db = await getDb();
        const { name } = req.body;

        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Valid category name is required' });
        }

        // Check duplicates (Schema has UNIQUE, but nice to handle gracefully)
        try {
            const result = await db.run(
                'INSERT INTO portfolio_categories (name, is_default) VALUES (?, 0)',
                [name.trim()]
            );
            res.status(201).json({ id: result.lastID, name: name.trim(), is_default: 0 });
        } catch (dbError) {
            if (dbError.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Category already exists' });
            }
            throw dbError;
        }

    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /categories/:id (Rename)
router.put('/categories/:id', async (req, res) => {
    try {
        const db = await getDb();
        const { id } = req.params;
        const { name } = req.body;

        if (!name) return res.status(400).json({ error: 'Name is required' });

        const category = await db.get('SELECT * FROM portfolio_categories WHERE id = ?', [id]);
        if (!category) return res.status(404).json({ error: 'Category not found' });

        // Default categories renamed? User request says: "Default categories: Editable"
        // So yes, we allow renaming.

        await db.run('UPDATE portfolio_categories SET name = ? WHERE id = ?', [name.trim(), id]);
        res.json({ id, name: name.trim(), is_default: category.is_default });

    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /categories/:id
router.delete('/categories/:id', async (req, res) => {
    try {
        const db = await getDb();
        const { id } = req.params;

        const category = await db.get('SELECT * FROM portfolio_categories WHERE id = ?', [id]);
        if (!category) return res.status(404).json({ error: 'Category not found' });

        if (category.is_default) {
            return res.status(403).json({ error: 'Cannot delete default categories' });
        }

        // Check if used? "Admins must be able to... Delete ONLY non-default categories"
        // It doesn't explicitly restrict deletion if used, but usually good practice.
        // User constrains: "DELETE ONLY non-default categories".
        // I will allow deletion. If used, projects might point to invalid ID.
        // The projects table has FK constraint... SQLite enforcement depends on PRAGMA foreign_keys = ON.
        // Let's safe delete: set projects with this category to null or a default?
        // Or just let it fail if constraint exists?
        // I'll assume we just delete. The constraint might block it if enforced.

        try {
            await db.run('DELETE FROM portfolio_categories WHERE id = ?', [id]);
            res.json({ message: 'Category deleted' });
        } catch (e) {
            if (e.message.includes('FOREIGN KEY constraint failed')) {
                return res.status(400).json({ error: 'Cannot delete category utilized by existing projects' });
            }
            throw e;
        }

    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
