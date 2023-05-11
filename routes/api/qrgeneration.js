const express = require('express');

const router = express.Router();

const fs = require('fs');
const qr = require('qr-image')
const dbConn = require('../../config/db');

//--------------- GENERATE QR -----------------
//@routes GET http:localhost:7000/QR/a/generate
//@desc generates qr code from data base
//@access only to managers and administrators
router.post('/a/generate', async (req, res) => {
    const { qrcodecontent, qrlandmark, qrcity } = req.body;
  
    try {
      const qrCode = qr.image(qrcodecontent, { type: 'png', margin: 2, size: 10 });
    // If we want to output the image of qr code as a response
    //   res.setHeader('Content-type', 'image/png');
    //   qrCode.pipe(res);
  
      const qrCodeBuffer = qr.imageSync(qrcodecontent, { type: 'png', margin: 2, size: 10 });
      const qrCodeImage = qrCodeBuffer.toString('base64');
  
      const sql = `INSERT INTO qrtable(qr_codecontent, qr_landmark, qr_city) 
                   VALUES ("${qrcodecontent}", "${qrlandmark}", "${qrcity}")`;
  
      dbConn.query(sql, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({ success: false, error: 'Internal server error' });
        } else {
          console.log(result.insertId) // QR ID
          console.log(result);
          // If we want to output the signal that generation of qr code is successful, beneficial for front end dev
          res.status(200).json({ success: true, QRID: result.insertId, message: 'QR code generated successfully', qrCodeImage: qrCodeImage });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
//--------------- FECTH QR -----------------
//@routes GET http:localhost:7000/QR/a/qrcode/:qr_id
//@desc Fetch qr code from database
//@access only to managers and administrators
router.get('/a/qrcode/:qr_id', async (req, res) => {
  console.log(req.params)
  const qrId = req.params.qr_id;

  try {
    const sql = `SELECT qr_codecontent FROM qrtable WHERE qr_id = ${qrId}`;
    dbConn.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ success: false, error: 'Internal server error' });
      } else {
        if (result.length > 0) {
          const qrcodecontent = result[0].qr_codecontent;

          const filename = req.query.filename || 'qrcode.png';
          res.setHeader('Content-type', 'image/png');
          res.setHeader('Content-disposition', `attachment; filename="${qrcodecontent}.png"`);
          const qrCode = qr.image(qrcodecontent, { type: 'png', margin: 2, size: 10 });
          qrCode.pipe(res);
        } else {
          res.status(404).json({ success: false, error: 'QR code not found' });
        }
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// router.get('/a/qrcode/:qr_id', async (req, res) => {
//     console.log(req.params)
//     const qrId = req.params.qr_id;
  
//     try {
//       const sql = `SELECT qr_codecontent FROM qrtable WHERE qr_id = ${qrId}`;
//       dbConn.query(sql, (err, result) => {
//         if (err) {
//           console.log(err);
//           res.status(500).json({ success: false, error: 'Internal server error' });
//         } else {
//           if (result.length > 0) {
//             const qrcodecontent = result[0].qr_codecontent;

//             const filename = req.query.filename || 'qrcode.png';

//             const qrCode = qr.image(qrcodecontent, { type: 'png', margin: 2, size: 10 });
//             res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
//             res.setHeader('Content-type', 'image/png');
//             qrCode.pipe(res);
//           } else {
//             res.status(404).json({ success: false, error: 'QR code not found' });
//           }
//         }
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ success: false, error: 'Internal server error' });
//     }
// });

//CHECKs qr code content
router.post('/a/checker', async (req, res) => {
  console.log(req.body)
  var qrcodecontent = req.body.qrcodecontent
  try{
    sqlQuery = `SELECT qr_id, qr_codecontent FROM qrtable WHERE qr_codecontent = "${qrcodecontent}"`;
    dbConn.query(sqlQuery, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'An error occurred' });
      }
      if (results.length > 0) {
        // If email exists, send response to frontend indicating that the email has already been taken
    
        return res.status(400).json({
          success: false,
          message: 'QR code string already exists in the database'
        });
      } else{
        return res.status(200).json({
          success: true,
          message: 'QR code string does NOT exists yet in the datase'
        })
      }
    })
  }
  catch{

  }
});


  
module.exports = router;
