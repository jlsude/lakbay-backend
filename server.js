const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const https = require('https');
const fs = require('fs');
require('dotenv').config({path: "./.env"});

const loginpageRoutes = require('./routes/api/loginpage.js');
const homeRoutes = require('./routes/api/home.js');
const qrRoutes = require('./routes/api/qrgeneration.js');
const scanLakbay = require('./routes/api/scanlakbay.js');
const lakbayContents = require('./routes/api/lakbaycontents.js');

// // CORS configuration
// app.use(cors({
//   origin: 'https://192.168.1.12:8081',
//   methods: ['GET', 'PUT', 'POST', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   secure: true
// }));



// this allows cross-origin XMLHttpRequest (XHR) request
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://192.168.1.12:8081');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
        // intercepts OPTIONS method
        if ('OPTIONS' === req.method) {
            // respond with 200
            res.sendStatus(200);
          } else {
            // move on
            next();
          }
      
  });


// this enables CORS for all routes
app.use(cors({
    origin: ['http://192.168.1.12:8081'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));








// init Middleware ---------------------
app.use(express.json({extended: false }));

// users api
app.use('/loginpage', loginpageRoutes);
app.use('/home', homeRoutes);
app.use('/LakbayScan', scanLakbay);

// admin api
app.use('/QR', qrRoutes);
app.use('/Lakbay', lakbayContents);

app.get('/', (req,res) => res.send('API is running'));
// const PORT = process.env.PORT || 7000;
// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Create HTTP and HTTPS servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer({
  key: fs.readFileSync('server.key'), // This is a self-signed certificate
  cert: fs.readFileSync('server.crt') // generated for testing purposes only
}, app);
// Start both servers
const PORT = process.env.PORT || 7000;
const PORT2 = process.env.PORT || 8000;
httpServer.listen(PORT, () => console.log(`HTTP Server started on port ${PORT}`));
httpsServer.listen(PORT2, () => console.log(`HTTPS Server started on port ${PORT2}`));


