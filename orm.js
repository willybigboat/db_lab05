// orm.js
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('university_db', 'root', '000000', {
  host: 'localhost',
  dialect: 'mariadb',
  port: 3307,
  logging: false,
});

module.exports = { sequelize, DataTypes };
