
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '000000',
  port: 3307,
  database: 'university_db',
  connectionLimit: 5
});

module.exports = pool;
