const express = require('express');
const router = express.Router();
const dbConn = require('../../config/db');
const jwt = require('jsonwebtoken');
const multer = require('multer');



//------------------------ Uploading Images and GET Request endpoint --------------------------
// Define storage for images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/BeginLakbayImages')
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


// ----------------------------------- Adding bucketlist
router.post('/addingbucketlist', upload.single('bucketlistimage'), async (req, res) => {
    console.log(req.body)
    console.log(req.file)
  

    const bucketlistname = req.body.bucketlistname;
    const bucketlistintro = req.body.bucketlistintro;
    const bucketlistimage = req.file.filename;
  
    try {
      var sqlQuery = `INSERT INTO lakbayBucketListTable (bucketlist_name, bucketlist_intro, bucketlist_image) 
                  VALUES ("${bucketlistname}", "${bucketlistintro}", "${bucketlistimage}");`
  
        dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);

    });
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


// -------------------------------- GET ALL request
router.get('/allview/', async (req, res) => {


  try {
    const sqlQuery = `SELECT *  FROM lakbayBucketListTable`;
    dbConn.query(sqlQuery, function (error, results, fields) {
      if (error) throw error;
      
      res.status(200).json(results);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


router.post('/search/bucketlist', async (req, res) => {

  var keywords = req.body.keywords

  try {
    const sqlQuery = `SELECT *  FROM lakbayBucketListTable WHERE bucketlist_name LIKE '%${keywords}%'`;
    dbConn.query(sqlQuery, function (error, results, fields) {
      if (error) throw error;
      
      res.status(200).json(results);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});






// -------------------------------- GET request
router.get('/view/:bucketlistid', async (req, res) => {
    console.log(req.params)
    const bucketlistid = req.params.bucketlistid;
  
    try {
      const sqlQuery = `SELECT bucketlist_id, bucketlist_location, bucketlist_name, bucketlist_intro, bucketlist_image  
      FROM lakbayBucketListTable WHERE bucketlist_id = '${bucketlistid}';`;
      dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        const images = results.map((result) => ({
          bucketlist_id: result.bucketlist_id,
          buckelistlocation: result.bucketlist_location,
          bucketlist_name: result.bucketlist_name,
          bucketlist_intro: result.bucketlist_intro,
          url: `http://localhost:7000/bucketlist/view/image/${result.bucketlist_image}`
        }));
        res.status(200).json(images);
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  router.get('/view/image/:bucketlist_image', async (req, res) => {
    console.log(req.params)
    const bucketlist_image = req.params.bucketlist_image;

    try {
        res.sendFile(bucketlist_image, { root: 'assets/BeginLakbayImages' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
  


// ----------------------------------- Adding location to the bucketlist
router.post('/add/locationbucketlist', async (req, res) => {
    const bucketlistid = req.body.bucketlistid;
    const landmarkid = req.body.landmarkid;
  
    try {
      const sqlQuery = `INSERT INTO locbucketlistTable (bucketlist_id, landmark_id) 
      VALUES ("${bucketlistid}", "${landmarkid}");`
      dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;

        res.status(200).json(results);
        
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ------------------------------- GET request of location names under bucketlist id
router.get('/view/locations/:bucketlistid', async (req, res) => {
    console.log(req.params)
    const bucketlistid = req.params.bucketlistid;

    try {
      const sqlQuery = `SELECT landmarkTable.landmark_id, landmarkTable.landmark_name
      FROM locbucketlistTable 
      JOIN lakbayBucketListTable ON locbucketlistTable.bucketlist_id = lakbayBucketListTable.bucketlist_id 
      JOIN landmarkTable ON locbucketlistTable.landmark_id = landmarkTable.landmark_id 
      WHERE lakbayBucketListTable.bucketlist_id = "${bucketlistid}";`

      dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


// ------------------------------ Delete bucketlist
router.post('/delete/bucketlist', (req, res) => {
  console.log(req.body)
  var bucketlistid = req.body.bucketlistid;

  try {

      sqlQuery = `DELETE FROM locbucketlistTable
        WHERE bucketlist_id = '${bucketlistid}';`

          dbConn.query(sqlQuery, function (error, results, fields) {
              if (error) throw error

              sqlQuery2 = `DELETE FROM lakbayBucketListTable
              WHERE bucketlist_id = '${bucketlistid}';`
              dbConn.query(sqlQuery2, function (error, results, fields) {
                if (error) throw error
  
                  res.status(200).json(results);
            })
          })
      
  } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
  }
})



module.exports = router;