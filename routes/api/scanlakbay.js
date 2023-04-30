var express = require('express');

var router = express.Router();

var dbConn = require('../../config/db');

const jwt = require('jsonwebtoken');



//------------------- Endpoints for Content Section of Lakbay, GET requests for Image is in Manage.js
router.post('/u/scanning', (req, res) => {
    console.log(req.body)
    var qrcodecontent = req.body.qrcodecontent;

    
    try{
        sqlQuery = `SELECT landmark_id, landmark_name, landmark_city, landmark_address, landmark_region, 
            landmark_visits, landmark_typecontent
            FROM landmarktable INNER JOIN qrtable 
            ON landmarktable.qr_id = qrtable.qr_id WHERE qr_codecontent = "${qrcodecontent}"`;

        dbConn.query(sqlQuery, function (error, results, fields) {
            if (error) throw error;
            console.log("adadada",results)
            res.status(200).json(results);

            var landmarkVisits = results[0].landmark_visits + 1;
            var landmarkname = results[0].landmark_name;
            var updateQuery = `UPDATE landmarktable SET landmark_visits = ${landmarkVisits} WHERE landmark_name = "${landmarkname}"`;
            dbConn.query(updateQuery, function (error, results, fields) {
              if (error) throw error;
            //   console.log(results)
            //   res.status(200).json(results);
            });
        })

    }catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
    

})

router.post('/u/fetching', (req, res) => {
  console.log(req.body)
  var landmarkid = req.body.landmarkid;

  try{
      
      sqlQuery = `SELECT landmark_name, landmark_city, landmark_address, landmark_region, landmark_visits, landmark_typecontent
          FROM landmarktable WHERE landmark_id = "${landmarkid}"`;
      
      dbConn.query(sqlQuery, function (error, results, fields) {
          console.log(results)
          res.status(200).json(results);
  
      
      })

  }catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
  

})

//-------------------- Fectching Paragraphs --------------------------------
router.post('/u/fetching/paragraphs', (req, res) => {
  console.log(req.body)
  var landmarkid = req.body.landmarkid;

  try{
      
      sqlQuery = `SELECT landmark_id, info_paragraph, info_order FROM landmarkInfoTable 
         WHERE landmark_id = "${landmarkid}" ORDER BY info_order`;

      dbConn.query(sqlQuery, function (error, results, fields) {
          console.log(results)
          res.status(200).json(results);
      
      })

  }catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
  

})



module.exports = router;