const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./src/routes/api.routes');
const { initializeDatabase } = require('./src/config/db');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'https://pragatisinterio.in',
    'https://www.pragatisinterio.in',
    'http://localhost:5173',
    'http://localhost:4173'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Serve static assets (Check uploads first, then public/assets)
app.use('/assets', express.static(uploadsDir));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Basic root route
app.get('/', (req, res) => {
    res.send('Pragati Design Studio API is running. Access endpoints at /api/...');
});

// Routes
app.use('/api', apiRoutes);

// Initialize DB and start server
const startServer = async () => {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
