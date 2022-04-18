var Service = require('node-windows').Service;
// Criando um novo objeto do Serviço
var svc = new Service({
//Nome do servico
name:'nerdshq',
//Descricao que vai aparecer no Gerenciamento de serviço do Windows
description: 'Serviço de teste Nerds HQ',
//caminho absoluto do seu script

script: 'C:\\Users\\ICTS\\carrinho-inteligente\\Servidor\\Express\\index.js'
});

svc.on('install',function(){
    svc.start();
    });
    // instalando o servico
    svc.install();