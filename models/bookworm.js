const Sequelize = require('sequelize');
const dbStroage = require('../lib/db');

const model = dbStroage.define('bookworm', {
    'title': Sequelize.STRING,
    'thumb': Sequelize.STRING,
    'author': Sequelize.STRING,
    'view_cnt': Sequelize.INTEGER,
    'up_cnt': Sequelize.INTEGER,
    'comment_cnt': Sequelize.INTEGER,
    'status': Sequelize.INTEGER,
    'score': Sequelize.INTEGER,
    'summary': Sequelize.STRING,
    'country': Sequelize.STRING,
    'classify': Sequelize.STRING,
    'tag': Sequelize.STRING,
    'publish_at': Sequelize.DATE,
}, {
    tableName: 'bookworm',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: false,
});

model.unique = ['title'];

module.exports = model;
