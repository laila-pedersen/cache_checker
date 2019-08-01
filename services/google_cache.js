const rp = require('request-promise');
const moment = require('moment');

const googleCacheUrl = 'http://webcache.googleusercontent.com/search?q=cache:'
const keyEnglishString = 'It is a snapshot of the page as it appeared on'
const keyJapaneseString = 'のキャッシュです。 このページは'
const gmtString = 'GMT'

const fs = require('fs');

const cheerio = require('cheerio')
const html = fs.readFileSync('./services/google_cache_sample.html');
const $ = cheerio.load(html)


const getCachedDate = async (pageUrl) => {
  console.log('Start fetching cached date')
  // const html = await scrapeGoogleWebCache(pageUrl)
  // console.log(html)
  return new Promise( (resolve,reject) => {
    try {
      const firstDiv = $('[id$="google-cache-hdr"]').text()

      const splitString1 = firstDiv.split(keyJapaneseString)[1];
      const splitString2 = splitString1.split(gmtString)[0];

      const cacheDate = moment(splitString2, "YYYY年MM月DD日 HH:mm:ss");

      return resolve(cacheDate)
    } catch (e) {
      if (html.indexOf(keyEnglishString) == -1) {
        if (detectCaptcha(html) == true) {
          const errorType = 'Googleから人間ではなさそうな動きがバレました。次の実行まで待ちましょう'
          console.log(errorType)
          return reject(e)
        } else {
          const errorType = 'Googleで確認したら不明なエラーが起きました。ライラに連絡してみよう。'
          console.log(errorType)
          return reject(e)
        }
      }
    }
  });
}

const scrapeGoogleWebCache = (pageUrl) => {
  console.log('Start Scaping Google')
  console.log(pageUrl)
  return new Promise( (resolve,reject) => {
    rp(googleCacheUrl + pageUrl)
      .then(function(html){
        return resolve(html)
      })
      .catch(function(err){
        console.log('Something went wrong when scraping Google: ' + err)
        return reject(err)
      });
  });
}

function detectCaptcha(html) {
  var unusualTraffic = "Our systems have detected unusual traffic from your computer network."
  if (html.indexOf(unusualTraffic) !== -1) {
    return true
  }
}

module.exports = getCachedDate;
