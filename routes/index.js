const express = require('express');
const router = express.Router();
const rp = require('request-promise');
const getGoogleCache = require('../services/google_cache');
const checkSonetCache = require('../services/sonet_cache')
const googleSheets = require('../services/google_spreadsheets')

const testUrl = 'https://www.fx-cube.jp/content/i002'

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Cache Checker' });
});

/* POST form to receive sheet with page information */
router.post('/check_cache', async (req, res, next) => {
  try {
    const resultCollection = []

    let pageList = await googleSheets.getPagesFromSheet()
    pageList = pageList['pages']
    const pageCount = pageList.length
    console.log(pageList)

    await googleSheets.createSheet()

    for (i = 0; i < pageCount; i++) {
      console.log("Iteration: " + i)
      const page = pageList[i][0]
      const googleCacheDate = await getGoogleCache(page)

      const sonetResult = await checkSonetCache(page)

      const ary = [[page, googleCacheDate[0], googleCacheDate[1], sonetResult]]
      const finish = googleSheets.writeSheet(ary)
      await sleep()
    }
    res.send('Thank you, please wait while the request is being processed.')
  } catch (e) {
    next(e)
  }

});

function sleep() {
  return new Promise(resolve => setTimeout(resolve, randomDelayTime()));
}

function randomDelayTime() {
  const min = 10000;
  const max = 41000;
  const random = Math.random() * (+max - +min) + +min;

  return random
}

module.exports = router;
