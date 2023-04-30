const express = require('express');
const router = express.Router();
const dbConn = require('../../config/db');
const jwt = require('jsonwebtoken');
const multer = require('multer');


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
            res.status(200).json({ successs: true, landmarkID: results.insertId, results});
    
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
    var infoorder = req.body.infoorder;


    try{
        sqlQuery = `INSERT INTO landmarkInfoTable(landmark_id, info_paragraph, info_order) 
                VALUES (${landmarkid}, "${infoparagraph}", "${infoorder}")`
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
        cb(null, 'public/images')
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

router.get('/locations/:landmarkid', async (req, res) => {
    const landmarkid = req.params.landmarkid;

    try {
        var sqlQuery = `SELECT image_src FROM imagetable WHERE landmark_id = "${landmarkid}"`;
        
        dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        
        if (results.length > 0) {
            const imagePath = results[0].image_src;
            res.sendFile(imagePath, { root: 'public/images' });
        } else {
            res.status(404).json({ success: false, error: 'Image not found' });
        }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
  
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
          url: `http://192.168.1.21:7000/manage/locations/images/${result.image_src}`
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
        res.sendFile(image_src, { root: 'public/images' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

  
module.exports = router;
