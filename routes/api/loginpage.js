var express = require('express');

var router = express.Router();

var dbConn = require('../../config/db');

const jwt = require('jsonwebtoken');

const cors = require('cors');

//--------------- Sign up -----------------
//@routes POST http:localhost:7000/loginpage/u/login/signup
//@desc Insert user data to database
//@access public
router.post('/u/login/signup', (req, res) => {
	console.log(req.body);
	var useremail = req.body.useremail;
	var userpassword = req.body.userpassword;
	var userfirstname = req.body.userfirstname;
	var userlastname = req.body.userlastname;
	var userbirthdate = req.body.userbirthdate;
	var usercity = req.body.usercity;
	var message = req.body.message

	try {
	// Check if the email already exists in the database
	sqlQuery1 = `SELECT * FROM usertable WHERE user_email = "${useremail}"`

	dbConn.query(sqlQuery1, function (error, results, fields) {
		console.log("searching", useremail)
		if (error) {
		console.log(error);
		return res.status(500).json({ success: false, message: 'An error occurred' });
		}
		if (results.length > 0) {
		// If email exists, send response to frontend indicating that the email has already been taken

		return res.status(400).json({
			success: false,
			message: 'Email has already been taken'
		});
		} 
		else {
		// If email does not exist, insert the new user into the database
		sqlQuery2 = `INSERT INTO usertable(user_email, user_password, user_firstname, 
					user_lastname, user_birthdate, user_city, user_role)
					VALUES ("${useremail}",  "${userpassword}",  "${userfirstname}",  
					"${userlastname}",  "${userbirthdate}",  "${usercity}", "ADMIN")`

		dbConn.query(sqlQuery2, function (error, results, fields) {
			if (error) {
			console.log(error);
			return res.status(500).json({ success: false, message: 'An error occurred' });
			}
			console.log(results.insertId);
			userId = results.insertId
			res.status(200).json({ success: true, userId: userId });
		});
		}
	});
	} catch (error) {
	console.log(error);
	return res.status(500).json({ success: false, message: 'An error occurred' });
	}
});

//--------------- Login -----------------
//@routes POST http:localhost:7000/loginpage/u/login
//@desc Insert user credentials to database
//@access public
router.post('/u/login/', cors(), (req, res) => {
	console.log(req.body);
	var useremail = req.body.useremail;
	var userpassword = req.body.userpassword;

	try {

	sqlQuery = `SELECT * FROM usertable  WHERE user_email ="${useremail}" 
		AND user_password = "${userpassword}"`;

	dbConn.query(sqlQuery, function (error, results, fields) {
		if (error) {
			console.error(error);
			console.log("An error occurred during login.")
			return res.status(500).json({ success: false, message: 'An error occurred during login.' });

		}

		if (results.length === 0) {
		console.log("Invalid email or password.")
		return res.status(401).json({
			success: false,
			message: 'Invalid email or password.'
		});

		}
		console.log(results, `A user logged in`);
		var row = results[0];

		var user_id = row.user_id;
		var user_email = row.user_email;
		var user_firstname = row.user_firstname;
		var user_lastname = row.user_lastname;
		var user_role = row.user_role;
		var user_city = row.user_city;

		var data = {
		user_id: row.user_id,
		user_email: row.user_email,
		user_firstname: row.user_firstname,
		user_lastname: row.user_lastname,
		user_role: row.user_role,
		user_city: row.user_city
		}

		// Token creation
		token = jwt.sign(
			{ data: data },
			process.env.SECRET_TOKEN,
			{ expiresIn: '10m' }
		)

		return res.status(200).json({
			success: true,
			message: 'Login successful.',
			data: data.user_email,
			token: token
		})
	})
	}
	catch (error) {
		console.error(error);
		console.log("An error occurred during login.")
		return res.status(500).json({ success: false, message: '' });
	}
});




// get users testing
router.get('/m/getusers', (req, res) => {

	try {
	sqlQuery = `SELECT * FROM usertable`
	dbConn.query(sqlQuery, function (error, results, fields) {
		if (error) throw error;
		res.status(200).json(results);
	})
	}
	catch (error) {
		console.log(error);
		return next(error);
	}
})

module.exports = router;