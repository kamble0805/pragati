const mysql = require('mysql2/promise');

class MySQLWrapper {
    constructor(config) {
        this.pool = mysql.createPool(config);
    }

    async get(sql, params = []) {
        const [rows] = await this.pool.execute(sql, params);
        return rows.length > 0 ? rows[0] : undefined;
    }

    async all(sql, params = []) {
        const [rows] = await this.pool.execute(sql, params);
        return rows;
    }

    async run(sql, params = []) {
        const [result] = await this.pool.execute(sql, params);
        return {
            lastID: result.insertId,
            changes: result.affectedRows
        };
    }

    async exec(sql) {
        await this.pool.query(sql);
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = { MySQLWrapper };
