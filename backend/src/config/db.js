const { MySQLWrapper } = require('./mysql-wrapper');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from local backend .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

let db = null;

const initializeDatabase = async () => {
    if (db) return db;

    try {
        console.log('Connecting to MySQL database...');
        console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`User: ${process.env.DB_USER || 'root'}`);
        console.log(`Database: ${process.env.DB_NAME || 'pragati_design_studio'}`);

        db = new MySQLWrapper({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'pragati_design_studio',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test connection
        await db.get('SELECT 1');
        console.log('✅ Connected to MySQL database successfully.');

        return db;
    } catch (error) {
        console.error('❌ Error connecting to MySQL database:', error);
        throw error;
    }
};

const getDb = async () => {
    if (!db) {
        await initializeDatabase();
    }
    return db;
};

module.exports = { initializeDatabase, getDb };
