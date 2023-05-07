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

const manageContents = require('./routes/api/Manage.js');
const maps = require('./routes/api/maps.js');
const bucketlist = require('./routes/api/bucketlist.js');



const serverAddress = 'http://localhost:7000';
module.exports = serverAddress;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  secure: true
}));


// init Middleware ---------------------
app.use(express.json({extended: false }));

// users api
app.use('/loginpage', loginpageRoutes);
app.use('/home', homeRoutes);
app.use('/LakbayScan', scanLakbay);

// admin api
app.use('/QR', qrRoutes);
app.use('/Manage', manageContents);
app.use('/maps', maps);
app.use('/bucketlist', bucketlist);

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

