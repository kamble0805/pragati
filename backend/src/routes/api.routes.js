const { Router } = require('express');
const { getDb } = require('../config/db');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = Router();

// Mount Auth and Admin Routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// Generic handler for fetching data
const createGetHandler = (tableName, orderBy) => {
    return async (req, res) => {
        try {
            const db = await getDb();
            let query = `SELECT * FROM ${tableName}`;
            const limit = req.query.limit ? parseInt(req.query.limit) : null;

            if (orderBy) {
                query += ` ORDER BY ${orderBy}`;
            }
            if (limit && !isNaN(limit)) {
                query += ` LIMIT ${limit}`;
            }

            const data = await db.all(query);
            res.json(data);
        } catch (error) {
            console.error(`Error fetching ${tableName}:`, error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};

const createGetSingleHandler = (tableName) => {
    return async (req, res) => {
        try {
            const db = await getDb();
            const query = `SELECT * FROM ${tableName} LIMIT 1`;
            const data = await db.get(query);
            res.json(data);
        } catch (error) {
            console.error(`Error fetching ${tableName}:`, error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}

// Generic handler for creating data
const createPostHandler = (tableName, allowedFields) => {
    return async (req, res) => {
        try {
            const db = await getDb();

            // Filter body if allowedFields is provided
            let body = req.body;
            if (allowedFields) {
                const filtered = {};
                allowedFields.forEach(field => {
                    if (req.body[field] !== undefined) {
                        filtered[field] = req.body[field];
                    }
                });
                body = filtered;
            }

            const keys = Object.keys(body);
            const values = Object.values(body);
            const placeholders = keys.map(() => '?').join(',');

            // If no keys after filtering (or empty body), return error
            if (keys.length === 0) {
                return res.status(400).json({ error: 'No valid fields provided' });
            }

            const query = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`;

            console.log(`[${tableName}] Inserting:`, body);
            console.log(`[${tableName}] Query:`, query);

            const result = await db.run(query, values);

            console.log(`[${tableName}] Insert successful. ID:`, result.lastID);

            res.json({ id: result.lastID, ...body });
        } catch (error) {
            console.error(`Error creating in ${tableName}:`, error);
            console.error(`Failed data:`, req.body);
            res.status(500).json({ error: 'Internal Server Error', details: error.message || 'Unknown error' });
        }
    };
};

// Generic handler for updating data
const createPutHandler = (tableName, allowedFields) => {
    return async (req, res) => {
        try {
            const db = await getDb();
            const { id } = req.params;

            // Filter body if allowedFields is provided
            let body = req.body;
            if (allowedFields) {
                const filtered = {};
                allowedFields.forEach(field => {
                    if (req.body[field] !== undefined) {
                        filtered[field] = req.body[field];
                    }
                });
                body = filtered;
            }

            const keys = Object.keys(body);
            const values = Object.values(body);

            if (keys.length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }

            const setClause = keys.map((key) => `${key} = ?`).join(',');

            const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
            await db.run(query, [...values, id]);

            res.json({ id, ...body });
        } catch (error) {
            console.error(`Error updating ${tableName}:`, error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};

// Generic handler for deleting data
const createDeleteHandler = (tableName) => {
    return async (req, res) => {
        try {
            const db = await getDb();
            const { id } = req.params;

            const query = `DELETE FROM ${tableName} WHERE id = ?`;
            await db.run(query, [id]);

            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            console.error(`Error deleting from ${tableName}:`, error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};

// Navbar
router.get('/navbar', createGetHandler('navbar_links', 'display_order'));
router.post('/navbar', createPostHandler('navbar_links', ['name', 'href', 'display_order']));
router.put('/navbar/:id', createPutHandler('navbar_links', ['name', 'href', 'display_order']));
router.delete('/navbar/:id', createDeleteHandler('navbar_links'));

// Hero (Single entry expected)
router.get('/hero', createGetSingleHandler('hero_section'));
router.put('/hero', async (req, res) => {
    try {
        const db = await getDb();
        const { title, subtitle, image_url } = req.body;
        // Assuming we always update the first one or create if not exists
        const exists = await db.get('SELECT id FROM hero_section LIMIT 1');
        if (exists) {
            await db.run('UPDATE hero_section SET title = ?, subtitle = ?, image_url = ? WHERE id = ?', [title, subtitle, image_url, exists.id]);
        } else {
            await db.run('INSERT INTO hero_section (title, subtitle, image_url) VALUES (?, ?, ?)', [title, subtitle, image_url]);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

// Portfolio Categories
router.get('/categories', createGetHandler('portfolio_categories', 'display_order'));
router.post('/categories', createPostHandler('portfolio_categories', ['name', 'display_order']));
router.put('/categories/:id', createPutHandler('portfolio_categories', ['name', 'display_order']));
router.delete('/categories/:id', createDeleteHandler('portfolio_categories'));

// Services
router.get('/services', createGetHandler('services', 'display_order'));
router.post('/services', createPostHandler('services', ['title', 'description', 'image_url', 'is_active', 'display_order']));
router.put('/services/:id', createPutHandler('services', ['title', 'description', 'image_url', 'is_active', 'display_order']));
router.delete('/services/:id', createDeleteHandler('services'));

// Blogs
router.get('/blogs', createGetHandler('blogs', 'created_at DESC'));
router.post('/blogs', createPostHandler('blogs', ['title', 'slug', 'excerpt', 'content', 'author', 'category', 'image_url', 'is_published', 'published_at']));
router.put('/blogs/:id', createPutHandler('blogs', ['title', 'slug', 'excerpt', 'content', 'author', 'category', 'image_url', 'is_published', 'published_at']));
router.delete('/blogs/:id', createDeleteHandler('blogs'));

// Public Portfolio (Active Only)
router.get('/portfolio', async (req, res) => {
    try {
        const db = await getDb();
        const limit = req.query.limit ? parseInt(req.query.limit) : null;

        let query = `
            SELECT p.*, c.name as category_name 
            FROM projects p 
            LEFT JOIN portfolio_categories c ON p.category_id = c.id 
            WHERE p.is_active = 1
            ORDER BY display_order
        `;

        if (limit && !isNaN(limit)) {
            query += ` LIMIT ${limit}`;
        }

        const data = await db.all(query);

        // Map category_name back to category for frontend compatibility
        const mappedData = data.map((p) => {
            // Parse images if stored as JSON string
            let images = [];
            try {
                if (p.images) {
                    const parsed = JSON.parse(p.images);
                    images = Array.isArray(parsed) ? parsed : [];
                }
            } catch (e) {
                // If not JSON, assume legacy or empty
            }

            // Fallback to legacy image_url if images is empty
            if (images.length === 0 && p.image_url) {
                images = [p.image_url];
            }

            return {
                ...p,
                category: p.category_name || p.category, // Name preferred
                images: images
            };
        });

        res.json(mappedData);
    } catch (error) {
        console.error(`Error fetching public portfolio:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Projects (Admin - All)
router.get('/projects', async (req, res) => {
    try {
        const db = await getDb();
        // Join with portfolio_categories to get category name
        const query = `
            SELECT p.*, c.name as category_name 
            FROM projects p 
            LEFT JOIN portfolio_categories c ON p.category_id = c.id 
            ORDER BY display_order
        `;
        const data = await db.all(query);

        // Map category_name back to category for frontend compatibility if needed
        const mappedData = data.map((p) => ({
            ...p,
            category: p.category_name || p.category // fallback to string if exists
        }));

        res.json(mappedData);
    } catch (error) {
        console.error(`Error fetching projects:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/projects', async (req, res) => {
    try {
        const db = await getDb();
        // req.body contains all fields. We extract what we need to transform.
        const { title, location, category_id, description, images, is_active } = req.body;

        // Validation (basic)
        if (!title || !location || !category_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Ensure images is an array
        const imagesArray = Array.isArray(images) ? images : (images ? [images] : []);
        const imagesJson = JSON.stringify(imagesArray);
        // Use first image as main image_url for backwards compatibility
        const imageUrl = imagesArray.length > 0 ? imagesArray[0] : '';

        // Retrieve category name for response (optional but good for UI)
        const catObj = await db.get('SELECT name FROM portfolio_categories WHERE id = ?', [category_id]);

        if (!catObj) {
            return res.status(400).json({ error: 'Invalid category ID selected. Please verify categories.' });
        }

        const categoryName = catObj.name;

        // Default display_order to 0 if not provided (though DB default handles it)
        const query = `INSERT INTO projects (title, location, category_id, category, description, image_url, images, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        const result = await db.run(query, [
            title,
            location,
            category_id,
            categoryName,
            description || '',
            imageUrl,
            imagesJson,
            is_active !== undefined ? is_active : 1
        ]);

        res.json({
            id: result.lastID,
            title, location, category_id, category: categoryName, description,
            image_url: imageUrl,
            images: imagesArray,
            is_active
        });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message || 'Unknown error' });
    }
});

router.put('/projects/:id', async (req, res) => {
    try {
        const db = await getDb();
        const { id } = req.params;
        const { title, location, category_id, description, images, is_active } = req.body;

        const imagesArray = Array.isArray(images) ? images : (images ? [images] : []);
        const imagesJson = JSON.stringify(imagesArray);
        const imageUrl = imagesArray.length > 0 ? imagesArray[0] : '';

        let categoryName = '';
        if (category_id) {
            const catObj = await db.get('SELECT name FROM portfolio_categories WHERE id = ?', [category_id]);
            categoryName = catObj ? catObj.name : '';
        }

        const query = `UPDATE projects SET title = ?, location = ?, category_id = ?, category = ?, description = ?, image_url = ?, images = ?, is_active = ? WHERE id = ?`;
        await db.run(query, [
            title,
            location,
            category_id,
            categoryName,
            description,
            imageUrl,
            imagesJson,
            is_active,
            id
        ]);

        res.json({ id, ...req.body, category: categoryName });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/projects/:id', createDeleteHandler('projects'));

// Testimonials
router.get('/testimonials', createGetHandler('testimonials', 'display_order'));
router.post('/testimonials', createPostHandler('testimonials', ['quote', 'author', 'location', 'display_order']));
router.put('/testimonials/:id', createPutHandler('testimonials', ['quote', 'author', 'location', 'display_order']));
router.delete('/testimonials/:id', createDeleteHandler('testimonials'));

// Principles
router.get('/principles', createGetHandler('principles', 'display_order'));
router.post('/principles', createPostHandler('principles', ['title', 'description', 'image_url', 'display_order']));
router.put('/principles/:id', createPutHandler('principles', ['title', 'description', 'image_url', 'display_order']));
router.delete('/principles/:id', createDeleteHandler('principles'));

// Philosophy (Single entry expected)
router.get('/philosophy', createGetSingleHandler('philosophy'));
router.put('/philosophy', async (req, res) => {
    try {
        const db = await getDb();
        const { title, content, image_url } = req.body;
        const exists = await db.get('SELECT id FROM philosophy LIMIT 1');
        if (exists) {
            await db.run('UPDATE philosophy SET title = ?, content = ?, image_url = ? WHERE id = ?', [title, content, image_url, exists.id]);
        } else {
            await db.run('INSERT INTO philosophy (title, content, image_url) VALUES (?, ?, ?)', [title, content, image_url]);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

// Before-After (Single set expected)
router.get('/before-after', createGetSingleHandler('before_after'));
router.put('/before-after', async (req, res) => {
    try {
        const db = await getDb();
        const { title, description, before_image, after_image } = req.body;
        const exists = await db.get('SELECT id FROM before_after LIMIT 1');
        if (exists) {
            await db.run('UPDATE before_after SET title = ?, description = ?, before_image = ?, after_image = ? WHERE id = ?', [title, description, before_image, after_image, exists.id]);
        } else {
            await db.run('INSERT INTO before_after (title, description, before_image, after_image) VALUES (?, ?, ?, ?)', [title, description, before_image, after_image]);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

// Blogs
router.get('/blogs', createGetHandler('blogs', 'published_at DESC'));
router.post('/blogs', createPostHandler('blogs'));
router.put('/blogs/:id', createPutHandler('blogs'));
router.delete('/blogs/:id', createDeleteHandler('blogs'));

// Dashboard Stats
router.get('/dashboard', async (req, res) => {
    try {
        const db = await getDb();
        const servicesCount = await db.get('SELECT COUNT(*) as count FROM services');
        const activeServicesCount = await db.get('SELECT COUNT(*) as count FROM services WHERE is_active = 1');
        const projectsCount = await db.get('SELECT COUNT(*) as count FROM projects');
        const blogsCount = await db.get('SELECT COUNT(*) as count FROM blogs');
        const contactsCount = await db.get('SELECT COUNT(*) as count FROM contact_submissions');

        res.json({
            servicesCount: servicesCount.count,
            activeServicesCount: activeServicesCount.count,
            projectsCount: projectsCount.count,
            blogsCount: blogsCount.count,
            contactsCount: contactsCount.count
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Dashboard Tasks
router.get('/dashboard-tasks', async (req, res) => {
    try {
        const db = await getDb();
        const tasks = [];

        // 1. Inactive Services
        const inactiveServices = await db.all('SELECT id, title FROM services WHERE is_active = 0 LIMIT 5');
        inactiveServices.forEach((s) => {
            tasks.push({
                id: `service-${s.id}`,
                type: 'Service',
                title: s.title,
                status: 'Hidden',
                action: 'Review',
                link: '/admin/services'
            });
        });

        // 2. Recent Contact Submissions
        const recentContacts = await db.all('SELECT id, subject, submitted_at FROM contact_submissions ORDER BY submitted_at DESC LIMIT 5');
        recentContacts.forEach((c) => {
            tasks.push({
                id: `contact-${c.id}`,
                type: 'Inquiry',
                title: c.subject,
                status: 'New',
                action: 'Reply',
                link: '/admin/contacts'
            });
        });

        // 3. Unpublished Blogs
        const draftBlogs = await db.all('SELECT id, title FROM blogs WHERE is_published = 0 LIMIT 5');
        draftBlogs.forEach((b) => {
            tasks.push({
                id: `blog-${b.id}`,
                type: 'Blog',
                title: b.title,
                status: 'Draft',
                action: 'Publish',
                link: '/admin/blog'
            });
        });

        res.json(tasks);
    } catch (error) {
        console.error("Error fetching dashboard tasks:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// File Upload Endpoint
router.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Return only the filename or relative path
        res.json({ filePath: req.file.filename });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Contact Submissions
router.get('/contact-submissions', createGetHandler('contact_submissions', 'submitted_at DESC'));
router.post('/contact-submissions', async (req, res) => {
    try {
        const db = await getDb();
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const submitted_at = new Date().toISOString();

        const query = `INSERT INTO contact_submissions (name, email, subject, message, submitted_at) VALUES (?, ?, ?, ?, ?)`;
        const result = await db.run(query, [name, email, subject, message, submitted_at]);

        console.log('Contact submission saved:', { id: result.lastID, name, email, subject });

        res.json({
            id: result.lastID,
            name,
            email,
            subject,
            message,
            submitted_at
        });
    } catch (error) {
        console.error('Error saving contact submission:', error);
        res.status(500).json({ error: 'Failed to save contact submission' });
    }
});

module.exports = router;
