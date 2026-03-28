const { initializeDatabase } = require('../config/db');

const testInsert = async () => {
    try {
        const db = await initializeDatabase();
        console.log('Testing insert into projects...');

        const title = 'Test Project ' + Date.now();
        const location = 'Test Location';
        const category_id = 99999; // Intentionally using a likely non-existent ID first to test constraints
        const categoryName = 'Test Category';
        const description = 'Test Description';
        const imageUrl = 'test.jpg';
        const imagesJson = JSON.stringify(['test.jpg']);
        const is_active = 1;

        const query = `INSERT INTO projects (title, location, category_id, category, description, image_url, images, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        console.log('Attempting insert...');
        await db.run(query, [
            title,
            location,
            category_id,
            categoryName,
            description,
            imageUrl,
            imagesJson,
            is_active
        ]);

        console.log('Insert successful!');
        process.exit(0);
    } catch (error) {
        console.error('Insert failed with error:', error);
        if (error.code) console.error('Error Code:', error.code);
        if (error.sqlMessage) console.error('SQL Message:', error.sqlMessage);
        process.exit(1);
    }
};

testInsert();
