const express = require("express"); // Importando o express
const app = express(); // iniciando o express
app.use(express.json())

const data = 
   
    {
        "data":
    {
      "p1": "0",
      "p2": "0",
      "p3": "1",
      "p4": "1",
      "p5": "1",
      "p6": "0",
      "p7": "0",
      "p8": "1",
      "p9": "0",
      "p10": "1",
      "p11": "1",
      "p12": "1",
      "p13": "1",
      "p14": "1",
      "p15": "1",
      "p16": "1"
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



app.listen(80,function(erro){
    if(erro){
        console.log("Ocorreu um erro!");
    }else{
        console.log("Servidor iniciado com sucesso!");
    }
    
})

