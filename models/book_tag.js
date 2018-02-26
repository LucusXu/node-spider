const Sequelize = require('sequelize');
const dbStroage = require('../lib/db');

const model = dbStroage.define('book_tag', {
    'tag': Sequelize.STRING,
    'site': Sequelize.STRING,
    'classify': Sequelize.STRING,
    'sum': Sequelize.INTEGER,
    'url': Sequelize.STRING,
}, {
    tableName: 'book_tags',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: false,
});

model.unique = ['tag'];

module.exports = model;
