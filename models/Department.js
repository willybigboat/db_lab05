const { sequelize, DataTypes } = require('../orm');

const Department = sequelize.define('Department', {
  Department_ID: {
    type: DataTypes.CHAR(5),
    primaryKey: true,
    allowNull: false
  },
  Name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  Location: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  Established_Year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Chair_ID: {
    type: DataTypes.CHAR(6),
    allowNull: true
  },
  College: {
    type: DataTypes.STRING(30),
    allowNull: true
  }
}, {
  tableName: 'DEPARTMENT',
  timestamps: false
});

module.exports = Department;
