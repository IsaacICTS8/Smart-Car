const Sequelize = require('sequelize');

const connection = new Sequelize('guiaperguntas','root','multilaiser',{
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = connection;