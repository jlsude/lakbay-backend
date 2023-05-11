const express = require('express');
const router = express.Router();
const dbConn = require('../../config/db');
const jwt = require('jsonwebtoken');
const multer = require('multer');



//------------------------ Uploading Images and GET Request endpoint --------------------------
// Define storage for images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/Maps')
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


// ----------------------------------- Adding Maps
router.post('/adding', upload.single('mapimagesrc'), async (req, res) => {
    console.log(req.body)
    console.log(req.file)
  
    const maplocation = req.body.maplocation;
    const mapkeywords = req.body.mapkeywords;
    const mapimagesrc = req.file.filename;
  
    try {
      var sqlQuery = `INSERT INTO maptable (map_location, map_keywords, map_image) 
                  VALUES ("${maplocation}", "${mapkeywords}", "${mapimagesrc}");`
  
        dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);

    });
    }catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// -------------------------------- GET request
router.post('/get/one', async (req, res) => {
    console.log(req.body)
    const mapid = req.body.mapid;
  
    try {
      const sqlQuery = `SELECT map_id, map_location, map_keywords, map_image  FROM mapTable WHERE map_id = '${mapid}';`;
      dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        const images = results.map((result) => ({
          map_id: result.map_id,
          map_location: result.map_location,
          map_keywords: result.map_keywords,

          url: `http://localhost:7000/maps/view/image/${result.map_image}`
        }));
        res.status(200).json(images);
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  router.get('/view/image/:map_image', async (req, res) => {
    console.log(req.params)
    const map_image = req.params.map_image;

    try {
        res.sendFile(map_image, { root: 'assets/Maps' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
  


// ----------------------------------- Searching maps by keywords
router.post('/search/keywords', async (req, res) => {
    console.log(req.body)
    var keywords = req.body.keywords;
  
    try {
      const sqlQuery = `SELECT map_id, map_location, map_image FROM mapTable WHERE map_keywords LIKE '%${keywords}%';`
      dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        const images = results.map((result) => ({
          map_id: result.map_id,
          map_location: result.map_location,
          map_keywords: result.map_keywords,

          url: `http://localhost:7000/maps/view/image/${result.map_image}`
        }));
        res.status(200).json(images);
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ----------------------------------- Get ALL maps request
router.get('/allview', async (req, res) => {


  try {
    const sqlQuery = `SELECT * FROM mapTable;`
    dbConn.query(sqlQuery, function (error, results, fields) {
      if (error) throw error;
      const images = results.map((result) => ({
        map_id: result.map_id,
        map_location: result.map_location,
        map_keywords: result.map_keywords,

        url: `http://localhost:7000/maps/view/image/${result.map_image}`
      }));
      res.status(200).json(images);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


router.post('/deleting/map', (req, res) => {
  var mapid = req.body.mapid;

  try {
    
    sqlQuery = `DELETE FROM mapTable WHERE map_id = '${mapid}'`
    dbConn.query(sqlQuery, function (error, results, fields) {
      if (error) throw error;
      res.status(200).json(results);
    });


  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
})
module.exports = router;