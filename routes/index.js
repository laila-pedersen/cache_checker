const express = require('express');
const router = express.Router();

/* GET home page. */
  res.render('index', { title: 'Express' });
router.get('/', (req, res, next) => {
});

module.exports = router;
