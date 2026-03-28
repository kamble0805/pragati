const axios = require('axios');

const testPost = async () => {
    try {
        console.log('Testing POST /api/projects...');
        const response = await axios.post('http://localhost:5000/api/projects', {
            title: 'Debug Project',
            location: 'Debug Loc',
            category_id: 1, // We hope 1 exists
            description: 'Debug Desc',
            images: [],
            is_active: 1
        });
        console.log('Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
};

const checkCategories = async () => {
    try {
        console.log('Fetching categories...');
        const response = await axios.get('http://localhost:5000/api/categories');
        console.log('Categories:', response.data);

        if (response.data.length > 0) {
            console.log('Retesting POST with valid category ID:', response.data[0].id);
            await axios.post('http://localhost:5000/api/projects', {
                title: 'Debug Project Valid',
                location: 'Debug Loc',
                category_id: response.data[0].id,
                description: 'Debug Desc',
                images: [],
                is_active: 1
            }).then(res => console.log('Success with valid ID:', res.data))
                .catch(err => console.log('Failed with valid ID:', err.response?.data || err.message));
        } else {
            console.log('No categories found. Cannot test project creation.');
        }
    } catch (error) {
        console.log('Failed to fetch categories:', error.message);
    }
}

testPost();
setTimeout(checkCategories, 1000);
