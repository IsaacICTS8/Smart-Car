
const express = require("express"); // Importando o express
const app = express(); // iniciando o express

const bodyParser = require("body-parser");

const connection = require("./database/database"); 
const Armazena = require("./database/armazena");
const C001 = require("./database/carrinho_lista");

const requestIp = require('request-ip');
const res = require("express/lib/response");

// Estou dizendo para o Express usar o EJS como View engine
app.set('view engine','ejs');
app.use(express.static('public'));
// Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var readline = require('readline');
var leitor = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


var name_carrinho = ""; //Nome de identificação do Carrinho
var andar_carrinho = "" ; // Informa o andar no carrinho
var lado_carrinho = "" ; // Informa o lado do carrinho
var posicao_carrinho = "" ; // Informa o posicao do andar no carrinho

 // Teste de Conexão
    connection
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.')
    })
    .catch ((error) => {
    console.error(error);
  })


app.use(express.json(),requestIp.mw())
const data =
{
    "data": {
        "id_carrinho": 10,
        "id_prateleira": 0,
        "id_LED": 80,
        "comando": 1,
        "modo" : 0 // Modo : 0 -> Modo de Alimentação ; 1 - > Modo Finalização ; 2 - > Modo Produção
    }

}
//Memória do Carrinho
var memoria =
{
    "posicao": {
        "floor0": { "p0": 255,
                    "p1": 255,
                    "p2": 255,
                    "p3": 255,
                    "p4": 255,
                    "p5": 255,
                    "p6": 255,
                    "p7": 255,
                    "p8": 255,
                    "p9": 255
                    },
        "floor1": { "p0": 255,
                   "p1": 255,
                   "p2": 255,
                   "p3": 255,
                   "p4": 255,
                   "p5": 255,
                   "p6": 255,
                   "p7": 255,
                   "p8": 255,
                   "p9": 255
                   },
        "floor2": { "p0": 255,
                    "p1": 255,
                    "p2": 255,
                    "p3": 255,
                    "p4": 255,
                    "p5": 255,
                    "p6": 255,
                    "p7": 255,
                    "p8": 255,
                    "p9": 255
                  },
        "floor3": {  "p0": 255,
                    "p1": 255,
                    "p2": 255,
                    "p3": 255,
                    "p4": 255,
                    "p5": 255,
                    "p6": 255,
                    "p7": 255,
                    "p8": 255,
                    "p9": 255
                },
        "floor4": {  "p0": 255,
                    "p1": 255,
                    "p2": 255,
                    "p3": 255,
                    "p4": 255,
                    "p5": 255,
                    "p6": 255,
                    "p7": 255,
                    "p8": 255,
                    "p9": 255
                 },
        "floor5": {  "p0": 255,
                 "p1": 255,
                 "p2": 255,
                 "p3": 255,
                 "p4": 255,
                 "p5": 255,
                 "p6": 255,
                 "p7": 255,
                 "p8": 255,
                 "p9": 255
              }
    }
}

//Realiza atualização da memória
app.get("/api",function(req,res){
   // res.send(customerWalletsDB);
   try {
    res.status(200).jsonp(data);
   } catch (error) {
       console.log(error);
   }
    
});

// Consulta o banco de dados para atualizar a mémoria do carrinho
app.get("/consulta/:namecar",(req,res) =>{
    var r;
    
    data['data']['id_LED'] = 0;
    data['data']['comando'] = 0;
    //data['data']['modo'] = 0;
            
   init_dados();
    
    C001.findAll(
        {raw :true, where: {name_car : req.params.namecar}, order:[['posicao','ASC']]
    }).then(buscar =>{
        if(buscar != undefined)
        {
            
            retorno = buscar
            console.log(retorno)
            for (const type of retorno) { 
               atualiza_memoria(type.posicao, type.andar);
            }
            
            res.send(buscar);
        }
    });

});

// Rota que faz a solicitação via página
app.post("/solicitar",(req,res) =>{
    var serial1 = req.body.serial;
    var nome_carro = req.body.namecar;
    serial = serial1.replace(/[&\/\\#,+()$~%.'":*?<>{}_`´-]/g,'');
    console.log(nome_carro)
    updateOrCreate(C001,{name_car : nome_carro,serial_comp : serial},{pedido: '1'});

    C001.findOne(
        { where : {name_car : nome_carro,serial_comp : serial}
    }).then(buscar =>{
        if(buscar != undefined)
        {
            
            data['data']['id_prateleira'] = buscar.andar;
            data['data']['id_LED'] = buscar.posicao;
            data['data']['comando'] = 1;
            data['data']['modo'] = 3;
            res.render("perguntar");       
        }else{
            res.redirect("/");
        }
    });

})

//Realiza a leitura da memoria do carrinho
app.get("/connect",function(req,res){
    // res.send(customerWalletsDB);
  
    try {
     res.status(200).jsonp(memoria);
    } catch (error) {
        console.log(error);
    }
     
 });

  //Rota que inicializa o abastecimento do carrinho
app.get("/inicio/:namecar", (req,res) =>{ 
    var nome_carro = req.params.namecar;
    //data['data']['modo'] = 0;
    updateOrCreate(Armazena,{name_carrinho:nome_carro},{name_carrinho:nome_carro,modo_carrinho: '0'});
    res.send("ok");

});
  //Rota que resetar o abastecimento do carrinho
  app.get("/reseta/:namecar", (req,res) =>{ 
    var nome_carro = req.params.namecar;
    data['data']['modo'] = 0;
    updateOrCreate(Armazena,{name_carrinho:nome_carro},{name_carrinho:nome_carro});
    DeleteAll_reg(C001,{name_car : nome_carro});     
    res.send("ok");

});

 //Rota que finalizar o abastecimento do carrinho
app.get("/fim/:namecar", (req,res) =>{ 
    var nome_carro = req.params.namecar;
    data['data']['modo'] = 1;
    updateOrCreate(Armazena,{name_carrinho:nome_carro},{name_carrinho:nome_carro,modo_carrinho: '1'});
    res.send("ok");
});

 //Rota de realimentação o abastecimento do carrinho
 app.get("/rload/:namecar", (req,res) =>{ 
    var nome_carro = req.params.namecar;
    data['data']['modo'] = 2;
    updateOrCreate(Armazena,{name_carrinho:nome_carro},{name_carrinho:nome_carro,modo_carrinho: '2'});
    res.send("ok");
});

// Confirma a posição e a retirada do material do carrinho
app.get("/confirmar/:posicao_car?,:serial?",(req,res) => {
    var serial1 = req.params.serial;
    var posicao_comp = req.params.posicao_car;
    var resposta = "";
    serial = serial1.replace(/[&\/\\#,+()$~%.'":*?<>{}_`´-]/g,'');

    name_carrinho = posicao_comp[0]+posicao_comp[1]+posicao_comp[2]+posicao_comp[3];
    resposta = posicao_comp[11]+posicao_comp[12]; //Armazena a posicao
    console.log(resposta);
    C001.findOne(
        { where : {name_car : name_carrinho,serial_comp : serial}
    }).then(buscar =>{
        if(buscar != undefined)
        {
            buscar.pedido=1
            if ((buscar.pedido == '1')&&(buscar.posicao == resposta))
            {
                data['data']['id_prateleira'] = buscar.andar;
                data['data']['id_LED'] = buscar.posicao;
                data['data']['comando'] = 0;
                Delete_reg(C001,{name_car : name_carrinho,serial_comp : serial},{pedido: '0'});
                res.send("Componente Solicitado");           
            }else{
                res.send("Não Solicitado");    
            }           
        }else{
            res.send("Não Encontrou");
        }
    });
});

//Cadastra o componete na posição desejada
app.post("/control/:serial?,:posicao_car?",(req,res) => {
    var serial = req.params.serial;
    var posicao_comp = req.params.posicao_car;
    var ip_req = requestIp.getClientIp(req);
    var id_local = '';
    format_dados_banco(posicao_comp);
    name_carrinho = posicao_comp[0]+posicao_comp[1]+posicao_comp[2]+posicao_comp[3];
    ip_req = ip_req.toString().replace('::ffff:', '');
    module.exports = name_carrinho;     
    data['data']['modo'] = 0;
        //Localiza o carrinho
    updateOrCreate(Armazena,{name_carrinho:name_carrinho},{name_carrinho:name_carrinho,modo_carrinho: '0'});
    res.send("ok")
    C001.create({
        name_car : name_carrinho,
        serial_comp: serial,
        andar : andar_carrinho,
        posicao  : posicao_carrinho,
        lado : lado_carrinho,
        pedido : '0'
        });
        data['data']['id_prateleira'] = andar_carrinho;
        data['data']['id_LED'] = posicao_carrinho;
        data['data']['comando'] = 0;            
});

// Abre a pagina inicial do carrinho inteligente
app.get("/",function(req,res){
    res.render("index");
});
//Abre a pagina de solicitação de material pro carrinho
app.get("/perguntar",function(req,res){
    res.render("perguntar");
});


app.listen(80,function(erro){
    if(erro){
        console.log("Ocorreu um erro!");
    }else{
        console.log("Servidor iniciado com sucesso!");
    }
    
});

leitor.on("line", function(answer) {
    var resp = answer;
    var part_id = 0;
    var andar = 0; 
    var lado  = 0 ;
    var pos_id=0;

    if ((resp[0]=='C')||(resp[0]=='c')){
    part_id = parseInt(resp[1]+resp[2]+resp[3],10); 
    console.log("ID = "+part_id);
        if((resp[4]=='A')||(resp[4]=='a')){
        andar = parseInt(resp[6],10);
        andar = (andar - 5)*-1;
        console.log("Andar = "+andar);
            if((resp[7]=='L')||(resp[7]=='l')){
                lado = parseInt(resp[9],10);
               
                console.log("Lado = "+lado);
                if((resp[10]=='P')||(resp[10]=='p')){
                    pos_id = parseInt(resp[11]+resp[12],10);
                     if (lado == 2){
                     pos_id = (pos_id - 41)*-1;
                     }
                     if (lado == 1){
                     pos_id = (pos_id - 81)*-1;
                     } 
                    console.log("Posicao = "+pos_id);
                    data['data']['id_prateleira'] = andar;
                    data['data']['id_LED'] = pos_id;
                    data['data']['comando'] = 0;
                    
                
                    }
            }
        }
    }
    if((resp[0]=='F')&&(resp[1]=='I')&&(resp[2]=='M')){

        data['data']['modo'] = 1;
        
    }
    if((resp[0]=='T')&&(resp[1]=='E')&&(resp[2]=='R')&&(resp[3]=='M')){
        pos_sim = getRandomInt(0,80);
        console.log(pos_sim);
        data['data']['modo'] = 0;
        data['data']['comando'] = 1;
        data['data']['id_LED'] = pos_sim;
    }
    if((resp[0]=='R')&&(resp[1]=='L')&&(resp[2]=='O')&&(resp[3]=='A')&&(resp[4]=='D')){
        console.log(pos_sim);
        data['data']['modo'] = 0;
        data['data']['comando'] = 0;
        data['data']['id_LED'] = pos_sim;
    }
   
});

function format_dados_banco(dados) // Formata dados pro banco de dados do carrinho
{
    name_carrinho = dados[0]+dados[1]+dados[2]+dados[3];
    andar_carrinho = dados[6];
    lado_carrinho  = dados[9];
    posicao_carrinho = dados[11]+dados[12];
}

async function format_dados_requisicao(dados_lido) // Formata dados pra requisição
{
    var dados = "";
    dados = dados_lido.name_car + "A" + dados_lido.andar + "L" + dados_lido.lado + "P" + dados_lido.posicao 
    console.log(dados);
    return dados;
}

function init_dados()  // Iniciar todos os dados da memória
{
    memoria.posicao.floor0.p9 = 255;
    memoria.posicao.floor0.p8 = 255;
    memoria.posicao.floor0.p7 = 255;
    memoria.posicao.floor0.p6 = 255;
    memoria.posicao.floor0.p5 = 255;
    memoria.posicao.floor0.p4 = 255;
    memoria.posicao.floor0.p3 = 255;
    memoria.posicao.floor0.p2 = 255;
    memoria.posicao.floor0.p1 = 255;
    memoria.posicao.floor0.p0 = 255;

    memoria.posicao.floor1.p9 = 255;
    memoria.posicao.floor1.p8 = 255;
    memoria.posicao.floor1.p7 = 255;
    memoria.posicao.floor1.p6 = 255;
    memoria.posicao.floor1.p5 = 255;
    memoria.posicao.floor1.p4 = 255;
    memoria.posicao.floor1.p3 = 255;
    memoria.posicao.floor1.p2 = 255;
    memoria.posicao.floor1.p1 = 255;
    memoria.posicao.floor1.p0 = 255;
    
    memoria.posicao.floor2.p9 = 255;
    memoria.posicao.floor2.p8 = 255;
    memoria.posicao.floor2.p7 = 255;
    memoria.posicao.floor2.p6 = 255;
    memoria.posicao.floor2.p5 = 255;
    memoria.posicao.floor2.p4 = 255;
    memoria.posicao.floor2.p3 = 255;
    memoria.posicao.floor2.p2 = 255;
    memoria.posicao.floor2.p1 = 255;
    memoria.posicao.floor2.p0 = 255;

    memoria.posicao.floor3.p9 = 255;
    memoria.posicao.floor3.p8 = 255;
    memoria.posicao.floor3.p7 = 255;
    memoria.posicao.floor3.p6 = 255;
    memoria.posicao.floor3.p5 = 255;
    memoria.posicao.floor3.p4 = 255;
    memoria.posicao.floor3.p3 = 255;
    memoria.posicao.floor3.p2 = 255;
    memoria.posicao.floor3.p1 = 255;
    memoria.posicao.floor3.p0 = 255;

    memoria.posicao.floor4.p9 = 255;
    memoria.posicao.floor4.p8 = 255;
    memoria.posicao.floor4.p7 = 255;
    memoria.posicao.floor4.p6 = 255;
    memoria.posicao.floor4.p5 = 255;
    memoria.posicao.floor4.p4 = 255;
    memoria.posicao.floor4.p3 = 255;
    memoria.posicao.floor4.p2 = 255;
    memoria.posicao.floor4.p1 = 255;
    memoria.posicao.floor4.p0 = 255;

    memoria.posicao.floor5.p9 = 255;
    memoria.posicao.floor5.p8 = 255;
    memoria.posicao.floor5.p7 = 255;
    memoria.posicao.floor5.p6 = 255;
    memoria.posicao.floor5.p5 = 255;
    memoria.posicao.floor5.p4 = 255;
    memoria.posicao.floor5.p3 = 255;
    memoria.posicao.floor5.p2 = 255;
    memoria.posicao.floor5.p1 = 255;
    memoria.posicao.floor5.p0 = 255;
}

function atualiza_memoria(dados_posicao, dados_andar) // Atuliza a memoria
{
    var num_posicao = Number.parseInt(dados_posicao, 10);
    var num_andar  = Number.parseInt(dados_andar, 10);
    var nr_pos = 0;
    console.log(num_andar + " , " + num_posicao);
    if(num_posicao >= 73){ 
        nr_pos = num_posicao - 73;
        if(num_andar == 0)
        {
        memoria.posicao.floor0.p9 = bitClear(memoria.posicao.floor0.p9,nr_pos);
        }
        if(num_andar == 1)
        {
        memoria.posicao.floor1.p9 = bitClear(memoria.posicao.floor1.p9,nr_pos);
        }
        if(num_andar == 2)
        {
        memoria.posicao.floor2.p9 = bitClear(memoria.posicao.floor2.p9,nr_pos);
        }
        if(num_andar == 3)
        {
        memoria.posicao.floor3.p9 = bitClear(memoria.posicao.floor3.p9,nr_pos);
        }
        if(num_andar == 4)
        {
        memoria.posicao.floor4.p9 = bitClear(memoria.posicao.floor4.p9,nr_pos);
        }
        if(num_andar == 5)
        {
        memoria.posicao.floor5.p9 = bitClear(memoria.posicao.floor5.p9,nr_pos);
        }
    }
    if((num_posicao <= 72)&&(num_posicao >= 65)){ 
        nr_pos = num_posicao - 65;
        if(num_andar == 0)
        {
        memoria.posicao.floor0.p8 = bitClear(memoria.posicao.floor0.p8,nr_pos);
        }
        if(num_andar == 1)
        {
        memoria.posicao.floor1.p8 = bitClear(memoria.posicao.floor1.p8,nr_pos);
        }
        if(num_andar == 2)
        {
        memoria.posicao.floor2.p8 = bitClear(memoria.posicao.floor2.p8,nr_pos);
        }
        if(num_andar == 3)
        {
        memoria.posicao.floor3.p8 = bitClear(memoria.posicao.floor3.p8,nr_pos);
        }
        if(num_andar == 4)
        {
        memoria.posicao.floor4.p8 = bitClear(memoria.posicao.floor4.p8,nr_pos);
        }
        if(num_andar == 5)
        {
        memoria.posicao.floor5.p8 = bitClear(memoria.posicao.floor5.p8,nr_pos);
        }
    }
    if((num_posicao <= 64)&&(num_posicao >= 57)){ 
        nr_pos = num_posicao - 57;
        if(num_andar == 0)
        {
        memoria.posicao.floor0.p7 = bitClear(memoria.posicao.floor0.p7,nr_pos);
        }
        if(num_andar == 1)
        {
        memoria.posicao.floor1.p7 = bitClear(memoria.posicao.floor1.p7,nr_pos);
        }
        if(num_andar == 2)
        {
        memoria.posicao.floor2.p7 = bitClear(memoria.posicao.floor2.p7,nr_pos);
        }
        if(num_andar == 3)
        {
        memoria.posicao.floor3.p7 = bitClear(memoria.posicao.floor3.p7,nr_pos);
        }
        if(num_andar == 4)
        {
        memoria.posicao.floor4.p7 = bitClear(memoria.posicao.floor4.p7,nr_pos);
        }
        if(num_andar == 5)
        {
        memoria.posicao.floor5.p7 = bitClear(memoria.posicao.floor5.p7,nr_pos);
        }
    }
    if((num_posicao <= 56)&&(num_posicao >= 49)){ 
        nr_pos = num_posicao - 49;
        if(num_andar == 0)
        {
        memoria.posicao.floor0.p6 = bitClear(memoria.posicao.floor0.p6,nr_pos);
        }
        if(num_andar == 1)
        {
        memoria.posicao.floor1.p6 = bitClear(memoria.posicao.floor1.p6,nr_pos);
        }
        if(num_andar == 2)
        {
        memoria.posicao.floor2.p6 = bitClear(memoria.posicao.floor2.p6,nr_pos);
        }
        if(num_andar == 3)
        {
        memoria.posicao.floor3.p6 = bitClear(memoria.posicao.floor3.p6,nr_pos);
        }
        if(num_andar == 4)
        {
        memoria.posicao.floor4.p6 = bitClear(memoria.posicao.floor4.p6,nr_pos);
        }
        if(num_andar == 5)
        {
        memoria.posicao.floor5.p6 = bitClear(memoria.posicao.floor5.p6,nr_pos);
        }
    }
    if((num_posicao <= 48)&&(num_posicao >= 41)){ 
        nr_pos = num_posicao - 41;
        if(num_andar == 0)
        {
        memoria.posicao.floor0.p5 = bitClear(memoria.posicao.floor0.p5,nr_pos);
        }
        if(num_andar == 1)
        {
        memoria.posicao.floor1.p5 = bitClear(memoria.posicao.floor1.p5,nr_pos);
        }
        if(num_andar == 2)
        {
        memoria.posicao.floor2.p5 = bitClear(memoria.posicao.floor2.p5,nr_pos);
        }
        if(num_andar == 3)
        {
        memoria.posicao.floor3.p5 = bitClear(memoria.posicao.floor3.p5,nr_pos);
        }
        if(num_andar == 4)
        {
        memoria.posicao.floor4.p5 = bitClear(memoria.posicao.floor4.p5,nr_pos);
        }
        if(num_andar == 5)
        {
        memoria.posicao.floor5.p5 = bitClear(memoria.posicao.floor5.p5,nr_pos);
        }
    }
    if((num_posicao <= 40)&&(num_posicao >= 33)){ 
        nr_pos = num_posicao - 33;
        if(num_andar == 0)
        {
        memoria.posicao.floor0.p4 = bitClear(memoria.posicao.floor0.p4,nr_pos);
        }
        if(num_andar == 1)
        {
        memoria.posicao.floor1.p4 = bitClear(memoria.posicao.floor1.p4,nr_pos);
        }
        if(num_andar == 2)
        {
        memoria.posicao.floor2.p4 = bitClear(memoria.posicao.floor2.p4,nr_pos);
        }
        if(num_andar == 3)
        {
        memoria.posicao.floor3.p4 = bitClear(memoria.posicao.floor3.p4,nr_pos);
        }
        if(num_andar == 4)
        {
        memoria.posicao.floor4.p4 = bitClear(memoria.posicao.floor4.p4,nr_pos);
        }
        if(num_andar == 5)
        {
        memoria.posicao.floor5.p4 = bitClear(memoria.posicao.floor5.p4,nr_pos);
        }
    }
    if((num_posicao <= 32)&&(num_posicao >= 25)){ 
        nr_pos = num_posicao - 25;
        if(num_andar == 0)
        {
        memoria.posicao.floor0.p3 = bitClear(memoria.posicao.floor0.p3,nr_pos);
        }
        if(num_andar == 1)
        {
        memoria.posicao.floor1.p3 = bitClear(memoria.posicao.floor1.p3,nr_pos);
        }
        if(num_andar == 2)
        {
        memoria.posicao.floor2.p3 = bitClear(memoria.posicao.floor2.p3,nr_pos);
        }
        if(num_andar == 3)
        {
        memoria.posicao.floor3.p3 = bitClear(memoria.posicao.floor3.p3,nr_pos);
        }
        if(num_andar == 4)
        {
        memoria.posicao.floor4.p3 = bitClear(memoria.posicao.floor4.p3,nr_pos);
        }
        if(num_andar == 5)
        {
        memoria.posicao.floor5.p3 = bitClear(memoria.posicao.floor5.p3,nr_pos);
        }
    }
    if((num_posicao <= 24)&&(num_posicao >= 17)){ 
        nr_pos = num_posicao - 17;
        if(num_andar == 0)
        {
        memoria.posicao.floor0.p2= bitClear(memoria.posicao.floor0.p2,nr_pos);
        }
        if(num_andar == 1)
        {
        memoria.posicao.floor1.p2 = bitClear(memoria.posicao.floor1.p2,nr_pos);
        }
        if(num_andar == 2)
        {
        memoria.posicao.floor2.p2 = bitClear(memoria.posicao.floor2.p2,nr_pos);
        }
        if(num_andar == 3)
        {
        memoria.posicao.floor3.p2 = bitClear(memoria.posicao.floor3.p2,nr_pos);
        }
        if(num_andar == 4)
        {
        memoria.posicao.floor4.p2 = bitClear(memoria.posicao.floor4.p2,nr_pos);
        }
        if(num_andar == 5)
        {
        memoria.posicao.floor5.p2 = bitClear(memoria.posicao.floor5.p2,nr_pos);
        }
    }
    if((num_posicao <= 16)&&(num_posicao >= 9)){ 
        nr_pos = num_posicao - 9;
        if(num_andar == 0)
        {
        memoria.posicao.floor0.p1 = bitClear(memoria.posicao.floor0.p1,nr_pos);
        }
        if(num_andar == 1)
        {
        memoria.posicao.floor1.p1 = bitClear(memoria.posicao.floor1.p1,nr_pos);
        }
        if(num_andar == 2)
        {
        memoria.posicao.floor2.p1 = bitClear(memoria.posicao.floor2.p1,nr_pos);
        }
        if(num_andar == 3)
        {
        memoria.posicao.floor3.p1 = bitClear(memoria.posicao.floor3.p1,nr_pos);
        }
        if(num_andar == 4)
        {
        memoria.posicao.floor4.p1 = bitClear(memoria.posicao.floor4.p1,nr_pos);
        }
        if(num_andar == 5)
        {
        memoria.posicao.floor5.p1 = bitClear(memoria.posicao.floor5.p1,nr_pos);
        }
    }
    if((num_posicao <= 8)&&(num_posicao >= 1)){ 
        nr_pos = num_posicao - 1;
        if(num_andar == 0)
        {
        memoria.posicao.floor0.p0 = bitClear(memoria.posicao.floor0.p0,nr_pos);
        }
        if(num_andar == 1)
        {
        memoria.posicao.floor1.p0 = bitClear(memoria.posicao.floor1.p0,nr_pos);
        }
        if(num_andar == 2)
        {
        memoria.posicao.floor2.p0 = bitClear(memoria.posicao.floor2.p0,nr_pos);
        }
        if(num_andar == 3)
        {
        memoria.posicao.floor3.p0 = bitClear(memoria.posicao.floor3.p0,nr_pos);
        }
        if(num_andar == 4)
        {
        memoria.posicao.floor4.p0 = bitClear(memoria.posicao.floor4.p0,nr_pos);
        }
        if(num_andar == 5)
        {
        memoria.posicao.floor5.p0 = bitClear(memoria.posicao.floor5.p0,nr_pos);
        }
    }
   //console.log(nr_pos +" , " + num_andar); 
  
}

function bitClear(value,bit_pos)  // Desliga o led
{
    var valor = 0;
    var valor_tmp = 255;
    valor_tmp  =  ~(1 << bit_pos);
    valor = value & valor_tmp;
    return valor;
}

async function updateOrCreate (model, where, newItem)  //Localiza o registro para atualizar , ou criar no banco de dados
{
    // First try to find the record
   const foundItem = await model.findOne({where});
   if (!foundItem) {
        // Item not found, create a new one
        return  ;
    }
    // Found an item, update it
    const item = await model.update(newItem, {where});
    return {item, created: false};
}


async function Delete_reg (model, where, newItem) {
    // First try to find the record
   const foundItem = await model.findOne({where});
   if (!foundItem) {
        // Item not found, create a new one
        
        return  {item, created: false};
    }
    // Found an item, update it
    foundItem.destroy();
   // const item = await model.destoy({where});
    return true;
}

async function DeleteAll_reg (model, where) {
    // First try to find the record
  
    model.destroy({
       where}, 
        {trucate: false}
    );
   // const item = await model.destoy({where});
    return true;
}