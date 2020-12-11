const dbConfig = require('../config/devConfig').dev.database;

const Pool = require('pg').Pool;
const pool = new Pool({
    user: dbConfig.user,
    host: dbConfig.host,
    database: dbConfig.database,
    password: dbConfig.password,
    port: dbConfig.port
});

module.exports = pool;