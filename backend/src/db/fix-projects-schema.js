const { initializeDatabase } = require('../config/db');

const checkSchema = async () => {
    try {
        const db = await initializeDatabase();
        console.log('Checking projects table schema...');

        // Get columns
        const columns = await db.all('DESCRIBE projects');
        const columnNames = columns.map(c => c.Field);
        console.log('Existing columns:', columnNames);

        // Check for 'images' column
        if (!columnNames.includes('images')) {
            console.log('Adding missing column: images');
            await db.exec('ALTER TABLE projects ADD COLUMN images JSON');
        }

        // Check for 'category' column (legacy but used in code)
        if (!columnNames.includes('category')) {
            console.log('Adding missing column: category');
            await db.exec('ALTER TABLE projects ADD COLUMN category VARCHAR(255)');
        }

        // Check for 'is_active'
        if (!columnNames.includes('is_active')) {
            console.log('Adding missing column: is_active');
            await db.exec('ALTER TABLE projects ADD COLUMN is_active TINYINT(1) DEFAULT 1');
        }

        console.log('Schema check complete.');
        process.exit(0);
    } catch (error) {
        console.error('Schema check failed:', error);
        process.exit(1);
    }
};

checkSchema();
