const { Sequelize } = require('sequelize');
const connection = new Sequelize('sistemacarinho', 'root', 'multilaiser', {
    host: 'localhost',
    dialect: 'mysql' 
  });
module.exports =  connection;