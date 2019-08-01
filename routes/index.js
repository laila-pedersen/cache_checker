const express = require('express');
const router = express.Router();
const rp = require('request-promise');
const getGoogleCache = require('../services/google_cache');
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

    const pageList = await googleSheets.getPagesFromSheet()
    const pageCount = pageList['pages'].length

    await googleSheets.createSheet()

    for (i = 0; i < pageCount; i++) {
      const page = pageList['pages'][i][0]
      const googleCacheDate = await getGoogleCache(page)

      const cacheDateInMs = Date.parse(googleCacheDate);
      const currentTime = new Date()
      const todayInMs = Date.parse(currentTime);
      const timePassedInMs = todayInMs - cacheDateInMs
      const oneDayInMs = 1000*60*60*24;

      const daysPassed = Math.round(timePassedInMs/oneDayInMs);

      const ary = [page, googleCacheDate, daysPassed, "So-net"]
      resultCollection.push(ary)
      await sleep()
    }

    const finish = googleSheets.writeSheet(resultCollection)

    res.send('Thank you, please wait while the request is being processed.')
  } catch (e) {
    next(e)
  }

});

// const sendToSheet = (resultCollection) => {
//   const options = {
//     method: 'POST',
//     uri: 'http://localhost:3000/spreadsheet/insert_result',
//     body: {
//         data: resultCollection
//     },
//     json: true // Automatically stringifies the body to JSON
//   };
//
//   rp(options)
//     .then(function (parsedBody) {
//       console.log("POST succeeded...")
//     })
//     .catch(function (err) {
//       console.log("POST failed with error " + err)
//     });
// }


// const getPageList = () => {
//   return new Promise( (resolve,reject) => {
//   rp('http://localhost:3000/spreadsheet/page_list')
//       .then( (res) => {
//         const json = JSON.parse(res)
//         return resolve(json)
//       })
//       .catch( (err) => {
//         console.log('Something went wrong when calling internal page_list API ' + err)
//         return reject(err)
//       });
//   });
// }

function sleep() {
  return new Promise(resolve => setTimeout(resolve, randomDelayTime()));
}

function randomDelayTime() {
  const min = 4000;
  const max = 11000;
  const random = Math.random() * (+max - +min) + +min;

  return random
}

module.exports = router;
