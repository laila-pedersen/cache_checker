const express = require('express');
const router = express.Router();

/* GET home page. */
  res.render('index', { title: 'Express' });
router.get('/', (req, res, next) => {

/* POST form to receive sheet with page information */
router.post('/check_cache', (req, res, next) => {
  const spreadsheeturl = req.body.spreadsheeturl
  res.send('Thank you, the result will end up at ' + spreadsheeturl)

});

module.exports = router;
