const Sequelize = require('sequelize');
const db = require('../env')['database'];

module.exports = new Sequelize(db.database, db.user, db.password, {
    host: db.host,
    port: db.port,
    dialect: 'mysql',
    dialectOptions: {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci"
    },
    maxConcurrentQueries: 100,
    logging: false,
    pool: {
        max: 10,
        min: 0,
        idle: 20000,
        acquire: 20000
    }
});
