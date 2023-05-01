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
            
            if (results.length === 0) {
              res.status(404).json({ success: false, message: 'QR code not recognized' });
              return;
            } else {

              console.log("Printing result",results)
              res.status(200).json(results);

              var landmarkVisits = results[0].landmark_visits + 1;
              var landmarkname = results[0].landmark_name;
              var updateQuery = `UPDATE landmarktable SET landmark_visits = ${landmarkVisits} WHERE landmark_name = "${landmarkname}"`;
              dbConn.query(updateQuery, function (error, results, fields) {
                if (error) throw error;
              
              });
            }
            
        })

    }catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
    

})

router.post('/u/fetching/ratings', (req, res) => {

  console.log(req.body)
  var landmarkid = req.body.landmarkid;

  try{
      
      sqlQuery = `SELECT AVG(review_rate) AS average_rating
      FROM reviewTable
      WHERE landmark_id = ${landmarkid};`;
      
      dbConn.query(sqlQuery, function (error, results, fields) {
          console.log(results)
          res.status(200).json(results);
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


//-------------------- Checking Review --------------------------------
router.post('/u/reviewlocation/checking', (req, res) => {
  console.log(req.body)
  var landmarkid = req.body.landmark_id;


  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    res.status(401).json({ success: false, msg: 'Authorization header is missing' });
    return;
  }

  const token = req.headers.authorization.split(' ')[1];
  if (!token){
      res.status(200).json({success: false, msg: 'Error, Token was not found'});
  }
  const decodedToken = jwt.verify(token,process.env.SECRET_TOKEN);

  console.log(decodedToken.data['user_id']);
  console.log(decodedToken.data['user_email']);

  try{
      
      sqlQuery = `SELECT * FROM reviewTable WHERE landmark_id = "${landmarkid}" 
      AND user_id = "${decodedToken.data['user_id']}"`;

      dbConn.query(sqlQuery, function (error, results, fields) {
          console.log(results)
          if (error) {
            console.log(error);
            res.status(500).json({ success: false, error: 'Internal server error' });
          } else if (results.length > 0){
            res.status(200).json({ message: 'You have already reviewed this Landmark before.', results });
          } else {
            res.status(200).json({ message: 'You may review.', results });
          }

      })

  }catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }


})


// ------------------------ Inserting a review --------------------------------
router.post('/u/reviewlocation', (req, res) => {
  console.log(req.body)
  var landmarkid = req.body.landmarkid;
  var reviewrate = req.body.reviewrate;
  var reviewinput = req.body.reviewinput;

  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    res.status(401).json({ success: false, msg: 'Authorization header is missing' });
    return;
  }

  const token = req.headers.authorization.split(' ')[1];
  if (!token){
      res.status(401).json({success: false, msg: 'Error, Token was not found'});
  }
  const decodedToken = jwt.verify(token,process.env.SECRET_TOKEN);

  console.log(decodedToken.data['user_id']);
  console.log(decodedToken.data['user_email']);

  try{
      
      sqlQuery = `INSERT INTO reviewTable (user_id, landmark_id, review_rate, review_input)
      VALUES ("${decodedToken.data['user_id']}", "${landmarkid}", ${reviewrate}, "${reviewinput}")`;

      dbConn.query(sqlQuery, function (error, results, fields) {
          if (error) {
            console.log(error);
            res.status(500).json({ success: false, error: 'Internal server error' });
          } else {
            console.log(results)
            res.status(200).json({ success: true, message: 'Your review has been recorded, enjoy your Lakbay', results });
          }
      });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }

});


module.exports = router;