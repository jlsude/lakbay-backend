const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config({path: "./.env"});


const loginpageRoutes = require('./routes/api/loginpage.js')
const homeRoutes = require('./routes/api/home.js')
const qrRoutes = require('./routes/api/qrgeneration.js')
const scanLakbay = require('./routes/api/scanlakbay.js')
const lakbayContents = require('./routes/api/lakbaycontents.js')

// this allows cross-origin XMLHttpRequest (XHR) request
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8082');
    next();
});

// this enables CORS for all routes
app.use(cors({
    origin: 'http://localhost:8082',
    allowedHeaders: 'Content-Type'
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
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

