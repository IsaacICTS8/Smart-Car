var express = require('express')
var cors = require('cors')
var app = express()

const corsOptions = {
    origin: [
      "http://ec2-3-210-231-150.compute-1.amazonaws.com:3000",
      "http://localhost:3000",
      process.env.PHOTO_SERVER_URL,
    ],
    optionsSuccessStatus: 200,
    methods: ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Access-Control-Allow-Headers",
      "Origin",
      "Accept",
      "X-Requested-With",
      "Content-Type",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
      "Authorization",
    ],
    credentials: true,
  };
  
app.use(cors(corsOptions))
 
app.get('/', function (req, res, next) {
  res.json({msg: 'This is CORS-enabled for all origins!'})
})
 
app.listen(80, function () {
  console.log('CORS-enabled web server listening on port 80')
})