const express = require('express');
const router = express.Router();
const dbConn = require('../../config/db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { route } = require('./maps');



// ---------------------------- Adding Landmark ------------------------------------------------

router.post('/a/add/landmark', (req, res) =>{
    console.log(req.body)
    var qrid = req.body.qrid;
    var landmarkname = req.body.landmarkname;
    var landmarkcity = req.body.landmarkcity;
    var landmarkaddress = req.body.landmarkaddress;
    var landmarkregion = req.body.landmarkregion;
    var landmarkcoordinates = req.body.landmarkcoordinates;
    var landmarkvisits = 0
    var landmarktypecontent = 1; // default for now


    try{
        sqlQuery = `INSERT INTO landmarktable(qr_id, landmark_name, landmark_city, landmark_address, landmark_region,
            landmark_coordinates, landmark_visits, landmark_typecontent) VALUES ("${qrid}", "${landmarkname}", 
            "${landmarkcity}", "${landmarkaddress}", "${landmarkregion}", "${landmarkcoordinates}", 
            ${landmarkvisits}, ${landmarktypecontent})`
        
        dbConn.query(sqlQuery, function (error, results, fields) {
            if (error) throw error;
            // ---- extracting landmark ID
            res.status(200).json({ success: true, message: 'Register successful, proceed below to finish the process', results });
    
        });
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }

})


// ------------------------------------------- Adding landmark information


router.post('/a/add/landmarkinfo', (req, res) =>{
    console.log(req.body)

    var landmarkid = req.body.landmarkid;
    var infoparagraph = req.body.infoparagraph;



    try{
        sqlQuery = `INSERT INTO landmarkInfoTable(landmark_id, info_paragraph, info_order) 
                VALUES (${landmarkid}, "${infoparagraph}", "0")`
        dbConn.query(sqlQuery, function (error, results, fields) {
            if (error) throw error;
            res.status(200).json(results);
    
        });
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
      

})

// ------------------------------------------- GET ALL LAndmark


router.get('/a/get/all/landmarks', (req, res) =>{
    try{
        sqlQuery = `SELECT * FROM landmarktable`;
        dbConn.query(sqlQuery, function (error, results, fields) {
            if (error) throw error;
            res.status(200).json(results);
    
        });
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
      

})
// ------------------------------------------- GET ALL LAndmark per Manager

router.get('/m/get/all/landmarks', (req, res) =>{

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
    console.log("Manager area: ", decodedToken.data['user_city']);

    try{
        sqlQuery = `SELECT * FROM landmarktable WHERE landmark_city = "${decodedToken.data['user_city']}"`;
        dbConn.query(sqlQuery, function (error, results, fields) {
            
            res.status(200).json(results);
    
        });
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
      

})

// ------------------------------------------ search Landmarks
router.post('/a/search/landmarks', (req, res) =>{
    console.log('Searching langdmark')
    var keywords = req.body.keywords;



    try{
        sqlQuery = `SELECT * FROM landmarktable WHERE landmark_name LIKE '%${keywords}%'`;
        dbConn.query(sqlQuery, function (error, results, fields) {
            if (error) throw error;
            res.status(200).json(results);
    
        });
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
      

})

router.post('/m/search/landmarks', (req, res) =>{
    console.log('Searching langdmark')
    var keywords = req.body.keywords;

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
    console.log("Manager area: ", decodedToken.data['user_city']);

    try{
        sqlQuery = `SELECT * FROM landmarktable WHERE landmark_city = "${decodedToken.data['user_city']}" 
            AND landmark_name LIKE '%${keywords}%'`;
        dbConn.query(sqlQuery, function (error, results, fields) {
            if (error) throw error;
            res.status(200).json(results);
    
        });
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
      

})




//------------------------ Uploading Images and GET Request endpoint --------------------------
// Define storage for images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/LandmarkImages')
},
filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
}
})

// Filter only image files
const fileFilter = (req, file, cb) => {
if (file.mimetype.startsWith('image/')) {
    cb(null, true)
} else {
    cb(new Error('File type not supported'), false)
}
}

// Set up multer with storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})

// -------------------- Performing a Location Image POST Request

router.post('/locations', upload.single('image_src'), async (req, res) => {
    console.log(req.body)
    console.log(req.file)
  
    const landmarkid = req.body.landmarkid;
    const imagecaption = req.body.imagecaption;
    const imagesrc = req.file.filename;
  
    try {
      var sqlQuery = `INSERT INTO imagetable (landmark_id, image_src, image_caption) 
                  VALUES ("${landmarkid}", "${imagesrc}", "${imagecaption}");`
  
        dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);

    });
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// -------------------- Performing an Image GET Request using landmark ID
router.get('/locations/:landmarkid', async (req, res) => {
    const landmarkid = req.params.landmarkid;

    try {
        var sqlQuery = `SELECT image_src FROM imagetable WHERE landmark_id = "${landmarkid}"`;
        
        dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        
        if (results.length > 0) {
            const imagePath = results[0].image_src;
            res.sendFile(imagePath, { root: 'assets/LandmarkImages' });
        } else {
            res.status(404).json({ success: false, error: 'Image not found' });
        }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// -------------------- Performing Images GET Request using landmark ID but with links
  
router.get('/locations/:landmarkid/images', async (req, res) => {
    console.log(req.params)
    const landmarkid = req.params.landmarkid;
  
    try {
      const sqlQuery = `SELECT image_id, landmark_id, image_src, image_caption FROM imagetable WHERE landmark_id = '${landmarkid}';`;
      dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        const images = results.map((result) => ({
          image_id: result.image_id,
          landmark_id: result.landmark_id,
          caption: result.image_caption,
          url: `http://localhost:7000/manage/locations/images/${result.image_src}`
        }));
        res.status(200).json(images);
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });


router.get('/locations/images/:image_src', async (req, res) => {
    console.log(req.params)
    const image_src = req.params.image_src;

    try {
        res.sendFile(image_src, { root: 'assets/LandmarkImages' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

//---------------------------------------- UPDATE LANDMARKSSS
router.put('/a/update/landmarkinfo', (req, res) =>{
    console.log(req.body)
    var infoid = req.body.infoid;
    var landmarkid = req.body.landmarkid;
    var infoparagraph = req.body.infoparagraph;

    try{
        sqlQuery = `UPDATE landmarkInfoTable
                    SET info_paragraph = "${infoparagraph}"
                    WHERE landmark_id = ${landmarkid} AND info_id = ${infoid}`
        dbConn.query(sqlQuery, function (error, results, fields) {
            if (error) throw error;
            res.status(200).json(results);
    
        });
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})

router.put('/update/locations/image', upload.single('image_src'), async (req, res) => {
    console.log(req.body)
    console.log(req.file)
    
    const imageid = req.body.imageid;
    const landmarkid = req.body.landmarkid;
    const imagecaption = req.body.imagecaption;
    const imagesrc = req.file.filename;
  
    try {
      var sqlQuery = `UPDATE imagetable
      SET image_src = "${imagesrc}", image_caption = "${imagecaption}"
      WHERE landmark_id = ${landmarkid} AND image_id = ${imageid};`
  
        dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);

    });
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// -------------------------------------------- Landmark DELETE
router.post('/delete/landmark', (req, res) => {
    var landmarkid = req.body.landmarkid;

    try {
        const sqlQuery1 = `DELETE FROM imageTable WHERE landmark_id = ${landmarkid}`;
        const sqlQuery2 = `DELETE FROM landmarkInfoTable WHERE landmark_id = ${landmarkid}`;
        const sqlQuery3 = `DELETE FROM locbucketlistTable WHERE landmark_id = ${landmarkid}`;
        const sqlQuery4 = `DELETE FROM lakbayBucketListTable WHERE bucketlist_id IN (SELECT bucketlist_id FROM locbucketlistTable WHERE landmark_id = ${landmarkid})`;
        const sqlQuery5 = `DELETE FROM userHistoryTable WHERE landmark_id = ${landmarkid}`;
        const sqlQuery6 = `DELETE FROM reviewTable WHERE landmark_id = ${landmarkid}`;
        const sqlQuery7 = `DELETE FROM landmarkTable WHERE landmark_id = ${landmarkid}`;
        const sqlQuery8 = `DELETE FROM qrTable WHERE qr_id = (SELECT qr_id FROM landmarkTable WHERE landmark_id = ${landmarkid})`;
        
        dbConn.query(sqlQuery1, function (error, results, fields) {
            if (error) throw error;
            
            dbConn.query(sqlQuery2, function (error, results, fields) {
                if (error) throw error;
                
                dbConn.query(sqlQuery3, function (error, results, fields) {
                    if (error) throw error;
                    
                    dbConn.query(sqlQuery4, function (error, results, fields) {
                        if (error) throw error;
                        
                        dbConn.query(sqlQuery5, function (error, results, fields) {
                            if (error) throw error;
                            
                            dbConn.query(sqlQuery6, function (error, results, fields) {
                                if (error) throw error;
                                
                                dbConn.query(sqlQuery7, function (error, results, fields) {
                                    if (error) throw error;
                                    
                                    dbConn.query(sqlQuery8, function (error, results, fields) {
                                        if (error) throw error;
                                        
                                        res.status(200).json(results);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


// ---------------------------------- register Manager
router.post('/register/manager', (req, res) => {
	var useremail = req.body.useremail;
	var userpassword = req.body.userpassword;
	var userfirstname = req.body.userfirstname;
	var userlastname = req.body.userlastname;
	var userbirthdate = req.body.userbirthdate;
	var usercity = req.body.usercity;
	var userrole = req.body.userrole;

    try {

        sqlQuery = `INSERT INTO usertable(user_email, user_password, user_firstname, 
            user_lastname, user_birthdate, user_city, user_role)
            VALUES ("${useremail}",  "${userpassword}",  "${userfirstname}",  
            "${userlastname}",  "${userbirthdate}",  "${usercity}", "${userrole}")`

            dbConn.query(sqlQuery, function (error, results, fields) {
                if (error) throw error
                res.status(200).json(results);
        
        })
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})


// ---------------------------------- MANAGER

router.get('/get/all/manager', (req, res) => {

    try {

        sqlQuery = `SELECT * FROM usertable WHERE user_role = "MANAGER";`

            dbConn.query(sqlQuery, function (error, results, fields) {
                if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: 'An error occurred' });
                }
                console.log(results)
                res.status(200).json(results);
            })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})


router.post('/search/manager', (req, res) => {
    console.log(req.body)
    var keywords = req.body.keywords;

    try {

        sqlQuery = `SELECT * FROM usertable WHERE user_role = 'MANAGER' AND user_city LIKE '%${keywords}%';`

            dbConn.query(sqlQuery, function (error, results, fields) {
                if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: 'An error occurred' });
                }
                console.log(results)
                res.status(200).json(results);
            })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})

router.post('/delete/manager', (req, res) => {
    console.log(req.body)
    var user_id = req.body.user_id;

    try {

        sqlQuery = `DELETE FROM usertable WHERE user_role = 'MANAGER' AND user_id = '${user_id}';`

            dbConn.query(sqlQuery, function (error, results, fields) {
                if (error) throw error
                res.status(200).json(results);
            })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})


// ---------------------------------- ADMIN

router.post('/register/admin', (req, res) => {
	var useremail = req.body.useremail;
	var userpassword = req.body.userpassword;
	var userfirstname = req.body.userfirstname;
	var userlastname = req.body.userlastname;
	var userbirthdate = req.body.userbirthdate;
	var usercity = req.body.usercity;
	var userrole = req.body.userrole;

    try {

        sqlQuery = `INSERT INTO usertable(user_email, user_password, user_firstname, 
            user_lastname, user_birthdate, user_city, user_role)
            VALUES ("${useremail}",  "${userpassword}",  "${userfirstname}",  
            "${userlastname}",  "${userbirthdate}",  "${usercity}", "${userrole}")`

            dbConn.query(sqlQuery, function (error, results, fields) {
                if (error) throw error
                res.status(200).json(results);
        
        })
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})




router.get('/get/all/admin', (req, res) => {

    try {

        sqlQuery = `SELECT * FROM usertable WHERE user_role = "ADMIN";`

            dbConn.query(sqlQuery, function (error, results, fields) {
                if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: 'An error occurred' });
                }
                console.log(results)
                res.status(200).json(results);
            })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})


router.post('/search/admin', (req, res) => {
    console.log(req.body)
    var keywords = req.body.keywords;

    try {

        sqlQuery = `SELECT * FROM usertable WHERE user_role = 'ADMIN' AND user_city LIKE '%${keywords}%';`

            dbConn.query(sqlQuery, function (error, results, fields) {
                if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: 'An error occurred' });
                }
                console.log(results)
                res.status(200).json(results);
            })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})

router.post('/delete/admin', (req, res) => {
    console.log("DELETE", req.body)
    var user_id = req.body.user_id;

    try {

        sqlQuery = `DELETE FROM usertable WHERE user_role = 'ADMIN' AND user_id = '${user_id}';`

            dbConn.query(sqlQuery, function (error, results, fields) {
                if (error) throw error
                res.status(200).json(results);
            })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})
module.exports = router;
