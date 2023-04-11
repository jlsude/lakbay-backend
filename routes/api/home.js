var express = require('express');

var router = express.Router();

var dbConn = require('../../config/db');

const jwt = require('jsonwebtoken');


//--------------- User History -----------------
//@routes POST http:localhost:7000/home/u/userhistory
//@desc outputs user history of landmarks visited
//@access unique to users

router.get('/u/userhistory', (req, res) => {


    const token = req.headers.authorization.split(' ')[1];
    if (!token){
        res.status(200).json({success: false, msg: 'Error, Token was not found'});
    }
    const decodedToken = jwt.verify(token,process.env.SECRET_TOKEN);

    console.log(decodedToken.data['user_id']);
    console.log(decodedToken.data['user_email']);

    sqlQuery = `SELECT * FROM userhistorytable ORDER BY "${decodedToken.data['user_id']}" DESC LIMIT 2`;
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