var express = require('express');

var router = express.Router();

var dbConn = require('../../config/db');

const jwt = require('jsonwebtoken');

//--------------- User Profile TESTING -----------------
//@routes POST http:localhost:7000/home/u/userhistory
//@desc outputs user profile
//@access unique to users
router.get('/u/userprofile', (req, res) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      res.status(401).json({ success: false, msg: 'Authorization header is missing' });
      return;
    }
  
    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, msg: 'JWT must be provided' });
      return;
    }
  
    try {
      const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
      console.log(decodedToken.data['user_id']);
      console.log(decodedToken.data['user_email']);
      const sqlQuery = `SELECT * FROM usertable WHERE user_id = ${decodedToken.data['user_id']}`;
      dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);
      });
    } catch (err) {
      res.status(401).json({ success: false, msg: 'Invalid JWT' });
    }
  });

//--------------- User History -----------------
//@routes POST http:localhost:7000/home/u/userhistory
//@desc outputs user history of landmarks visited
//@access unique to users

router.get('/u/userhistory', (req, res) => {
  console.log("GET history")
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

    sqlQuery = `SELECT userhistorytable.userhistory_id, landmarkTable.landmark_id, landmarkTable.landmark_name, landmarkTable.landmark_city, 
                landmarkTable.landmark_address, landmarkTable.landmark_region, landmarkTable.landmark_visits
                 FROM userHistoryTable INNER JOIN landmarkTable ON userHistoryTable.landmark_id 
                = landmarkTable.landmark_id WHERE userHistoryTable.user_id = "${decodedToken.data['user_id']}" 
                ORDER BY userhistorytable.userhistory_id`;
    dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);
        });

})


router.post('/u/adduserhistory', (req, res) => {
    
    const authorizationHeader = req.headers.authorization;
    var landmark_id = req.body.landmark_id;

    console.log(authorizationHeader)

    
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

    sqlQuery = `INSERT INTO userHistoryTable(user_id, landmark_id) VALUES ("${decodedToken.data['user_id']}", ${landmark_id})`;
    dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);
        });

})

//--------------- Lakbay Bucketlist -----------------
//@routes POST http:localhost:7000/home/u/lakbaybucketlist
//@desc outputs lakbay challenges suggested
//@access public to users, might be dependent to where user is
router.get('/u/lakbaybucketlist', (req, res) => {

    const token = req.headers.authorization.split(' ')[1];
    if (!token){
        res.status(200).json({success: false, msg: 'Error, Token was not found'});
    }
    const decodedToken = jwt.verify(token,process.env.SECRET_TOKEN);

    console.log(decodedToken.data['user_id']);
    console.log(decodedToken.data['user_city']);

    sqlQuery = `SELECT * FROM lakbaybucketlisttable WHERE buckelist_location = "${decodedToken.data['user_city']}"
        ORDER BY RAND() LIMIT 3`
    dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);
        });
})


//--------------- Begin Your Lakbay -----------------
//@routes POST http:localhost:7000/home/u/lakbaybucketlist
//@desc outputs lakbay locations suggestion
//@access public to users
//@note needs a component
router.get('/u/beginlakbay', (req, res) => {

    var searchcity = req.body.searchcity;

    const token = req.headers.authorization.split(' ')[1];
    if (!token){
        res.status(200).json({success: false, msg: 'Error, Token was not found'});
    }
    const decodedToken = jwt.verify(token,process.env.SECRET_TOKEN);

    console.log(decodedToken.data['user_id']);
    console.log(decodedToken.data['user_email']);

    sqlQuery = `SELECT * FROM maptable WHERE map_locationcity = "${searchcity}"`
    dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);
        });
})





module.exports = router;