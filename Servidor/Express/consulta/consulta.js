const Sequelize = require('sequelize');
const conection = require('./database');
const C001 = require("./database/carrinho_lista");

function consulta(dados)
{
    C001.findOne(
        { where : {name_car : nome_carro,serial_comp : serial}
    }).then(buscar =>{
        if(buscar != undefined)
        {
            
           // data['data']['id_prateleira'] = buscar.andar;
            //data['data']['id_LED'] = buscar.posicao;
            //data['data']['comando'] = 1;
            //data['data']['modo'] = 2;
            res.send(buscar.posicao);       
        }else{
            res.send("Não Encontrou");
        }
    });

}
export {consulta};
