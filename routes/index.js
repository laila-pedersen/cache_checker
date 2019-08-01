const express = require('express');
const router = express.Router();
const rp = require('request-promise');
const googleCache = require('../services/google_cache');

const testUrl = 'https://www.fx-cube.jp/content/i002'

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Cache Checker' });
});

/* POST form to receive sheet with page information */
router.post('/check_cache', async (req, res, next) => {
  try {
    const pageList = await getPageList()
    const pageCount = pageList['pages'].length
    const googleCacheDate = await googleCache(testUrl)

    for (i = 0; i < pageCount; i++) {
      let page = pageList['pages'][i][0]

    }
    res.send('Thank you, please wait while the request is being processed.')
  } catch (e) {
    next(e)
  }

});

const getPageList = () => {
  return new Promise( (resolve,reject) => {
  rp('http://localhost:3000/spreadsheet/page_list')
      .then( (res) => {
        const json = JSON.parse(res)
        return resolve(json)
      })
      .catch( (err) => {
        console.log('Something went wrong when calling internal page_list API ' + err)
        return reject(err)
      });
  });
}


module.exports = router;
