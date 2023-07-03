const Sequelize = require('sequelize');
const conection = require('./database');
 
// Esse parametro precisa ser dinamico

const Lista_posicao = conection.define("movimentacao_carrinho",{
    name_car:{
        type: Sequelize.TEXT,
        allowNull: false
    },    
    serial_comp:{
        type: Sequelize.TEXT,
        allowNull: false
    },
    posicao:{
        type: Sequelize.STRING,
        allowNull: false
    },
    andar:{
        type: Sequelize.STRING,
        allowNull: false
    },
    lado:{
        type: Sequelize.STRING,
        allowNull: false
    },
    pedido :{
        type: Sequelize.STRING,
        allowNull: false
    },
    deletedAt :{
        type: Sequelize.TIME,
        allowNull: true
    }
    

    
}, { freezeTableName: true });

Lista_posicao.sync({force: false}).then(() => {});
module.exports = Lista_posicao;