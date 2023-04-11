var express = require('express');

var router = express.Router();

var dbConn = require('../../config/db');

const jwt = require('jsonwebtoken');



router.post('/a/addlandmark', (req, res) =>{
    console.log(req.body)
    var qrid = req.body.qrid;
    var landmarkname = req.body.landmarkname;
    var landmarkcity = req.body.landmarkcity;
    var landmarkaddress = req.body.landmarkaddress;
    var landmarkregion = req.body.landmarkregion;
    var landmarkcoordinates = req.body.landmarkcoordinates;
    var landmarkvisits = req.body.landmarkvisits;


    try{
        sqlQuery = `INSERT INTO landmarktable(qr_id, landmark_name, landmark_city, landmark_address, landmark_region,
            landmark_coordinates, landmark_visits) VALUES ("${qrid}", "${landmarkname}", 
            "${landmarkcity}", "${landmarkaddress}", "${landmarkregion}", "${landmarkcoordinates}", ${landmarkvisits})`
        
        dbConn.query(sqlQuery, function (error, results, fields) {
            if (error) throw error;
            res.status(200).json(results);
    
        });
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
      

})
















  
module.exports = router;