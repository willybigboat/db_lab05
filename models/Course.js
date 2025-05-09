const { sequelize, DataTypes } = require('../orm');

const Course = sequelize.define('Course', {
    Course_ID: {
        type: DataTypes.CHAR(8),
        allowNull: false,
        primaryKey: true
    },
    Title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Credits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1 // 确保 Credits 大于 0
        }
    },
    Level: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
            isIn: [['大學部', '研究所']] // 检查 Level 的值
        }
    },
    Hours_Per_Week: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Department_ID: {
        type: DataTypes.CHAR(5),
        allowNull: true,
    }
}, {
  tableName: 'COURSE',
  timestamps: false
});

module.exports = Course;
