//const random = require("random");
const express = require("express"); // Importando o express
const app = express(); // iniciando o express
app.use(express.json());
//random.init((min=0),(max=80));

var readline = require('readline');
var resp = "";

var leitor = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/*
//Contruindo a Matriz
var linhas = 6; 
var colunas = 10; 
var matriz = new Array(colunas); 
for (var i = 0; i < colunas; i++) 
	matriz[i] = new Array(linhas); 
//print(matriz[10*20+10]);//imprime 100

for (var i = 0; i < colunas; i++) {
    for (var j = 0; j < linhas; j++) {
        matriz [i][j] = 0;

    }
}


console.log(matriz[0][0]);
*/
var pos_sim = 0;
const data =
{
    "data": {
        "id_carrinho": 10,
        "id_prateleira": 1,
        "id_LED": 77,
        "comando": 0,
        "modo" : 0  // Modo : 0 -> Modo de Alimentação ; 1 - > Modo Finalização ; 2 - > Modo Produção
    }

}
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
        "floor3": { "p0": 0,
                    "p1": 0,
                    "p2": 0,
                    "p3": 0,
                    "p4": 0,
                    "p5": 0,
                    "p6": 0,
                    "p7": 0,
                    "p8": 0,
                    "p9": 127
                  },
        "floor4": { "p0": 0,
                    "p1": 0,
                    "p2": 0,
                    "p3": 0,
                    "p4": 0,
                    "p5": 0,
                    "p6": 0,
                    "p7": 0,
                    "p8": 0,
                    "p9": 127
                  },
        "floor5": { "p0": 0,
                    "p1": 0,
                    "p2": 0,
                    "p3": 0,
                    "p4": 0,
                    "p5": 0,
                    "p6": 0,
                    "p7": 0,
                    "p8": 0,
                    "p9": 127
                    }
    }
}


app.get("/api",function(req,res){
   // res.send(customerWalletsDB);
   try {
    res.status(200).jsonp(data);
   } catch (error) {
       console.log(error);
   }
   
});

app.get("/connect",function(req,res){
    // res.send(customerWalletsDB);
    try {
     res.status(200).jsonp(memoria);
    } catch (error) {
        console.log(error);
    }
     
 });
 


app.listen(80,function(erro){
    if(erro){
        console.log("Ocorreu um erro!");
    }else{
        console.log("Servidor iniciado com sucesso!");
    }
    
})

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
        andar = parseInt(resp[5],10);
        andar = (andar - 5)*-1;
        console.log("Andar = "+andar);
            if((resp[6]=='L')||(resp[6]=='l')){
                lado = parseInt(resp[7],10);
               
                console.log("Lado = "+lado);
                if((resp[8]=='P')||(resp[8]=='p')){
                    pos_id = parseInt(resp[9]+resp[10],10);
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

function getRandomInt(min,max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max-min))+min;
}