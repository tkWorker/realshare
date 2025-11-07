const Database = require('better-sqlite3');
const db = new Database('./realshare.db');
module.exports = db;