const Sequelize = require('sequelize');
const conection = require('./database');
const Armazena = conection.define('carrinho',{
    name_carrinho:{
        type: Sequelize.STRING,
        allowNull: false
    } ,
    modo_carrinho:{
        type: Sequelize.STRING,
        allowNull: false
    },
  
    
} , { freezeTableName: true });

Armazena.sync({force: false}).then(() => {});
module.exports = Armazena;