const { Router } = require('express');
const { getDb } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pragati-secret-key-change-this-in-prod';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.userId = decoded.id;
        next();
    });
};

// Use verifyToken for protected routes
router.get('/', verifyToken, async (req, res) => {
    try {
        const db = await getDb();
        const admins = await db.all('SELECT id, email, created_at FROM admins');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const db = await getDb();
        const { id } = req.params;
        await db.run('DELETE FROM admins WHERE id = ?', [id]);
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete admin' });
    }
});

// Register Admin (Public if 0 admins, otherwise Protected)
router.post('/register', async (req, res) => {
    try {
        const db = await getDb();

        // Check if any admins exist
        const result = await db.get('SELECT COUNT(*) as count FROM admins');
        const adminCount = result ? result.count : 0;

        if (adminCount > 0) {
            // Admins exist, so this must be an authenticated request
            const token = req.headers['authorization'];
            if (!token) return res.status(403).json({ error: 'System already setup. Login to add more admins.' });

            try {
                jwt.verify(token.split(' ')[1], JWT_SECRET);
            } catch (err) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const insertResult = await db.run(
                'INSERT INTO admins (email, password_hash) VALUES (?, ?)',
                [email, hashedPassword]
            );
            res.status(201).json({ id: insertResult.lastID, email, message: 'Admin created successfully' });
        } catch (dbError) {
            if (dbError.message && (dbError.message.includes('UNIQUE constraint failed') || dbError.code === 'ER_DUP_ENTRY')) {
                return res.status(409).json({ error: 'Email already exists' });
            }
            throw dbError;
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login Admin (Public)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            console.log('[Login] Missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        console.log(`[Login] Attempt for email: ${email}`);

        // Get database connection
        const db = await getDb();

        // Fetch admin by email
        const admin = await db.get(
            'SELECT * FROM admins WHERE email = ?',
            [email.toLowerCase().trim()]
        );

        // Check if admin exists
        if (!admin) {
            console.log(`[Login] Admin not found: ${email}`);
            return res.status(401).json({ error: 'Admin not found' });
        }

        console.log(`[Login] Admin found: ${admin.email} (ID: ${admin.id})`);

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

        if (!isPasswordValid) {
            console.log(`[Login] Incorrect password for: ${email}`);
            return res.status(401).json({ error: 'Incorrect password' });
        }

        console.log(`[Login] Password verified for: ${email}`);

        // Create JWT token
        const tokenPayload = {
            id: admin.id,
            email: admin.email,
            role: 'admin'
        };

        const token = jwt.sign(
            tokenPayload,
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`[Login] Success! Token generated for: ${email}`);

        // Return success response
        res.json({
            user: {
                id: admin.id,
                email: admin.email
            },
            token
        });

    } catch (error) {
        console.error('[Login] Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
