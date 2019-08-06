const rp = require('request-promise');
const cheerio = require('cheerio')
const moment = require('moment');

const googleCacheUrl = 'http://webcache.googleusercontent.com/search?q=cache:'
// const keyEnglishString = 'It is a snapshot of the page as it appeared on'
const keyJapaneseString = 'のキャッシュです。 このページは'
const gmtString = 'GMT'


const getCachedDate = async (pageUrl) => {
  console.log('Start fetching cached date')
  const html = await scrapeGoogleWebCache(pageUrl)
  const $ = cheerio.load(html)

  return new Promise( (resolve,reject) => {
    try {
      if (html === "Error 404") {
        return resolve(["Error 404 (Not Found)", "?"])
      }
      const firstDiv = $('[id$="google-cache-hdr"]').text()

      const splitString1 = firstDiv.split(keyJapaneseString)[1];
      const splitString2 = splitString1.split(gmtString)[0];
      let cacheDate = moment(splitString2, "YYYY年MM月DD日 HH:mm:ss");

      const cacheDateInMs = Date.parse(cacheDate);
      const currentTime = new Date()
      const todayInMs = Date.parse(currentTime);
      const timePassedInMs = todayInMs - cacheDateInMs
      const oneDayInMs = 1000*60*60*24;
      const daysPassed = Math.round(timePassedInMs/oneDayInMs);

      cacheDate = cacheDate.format("YYYY/MM/DD")

      return resolve([cacheDate, daysPassed])
    } catch (e) {
      if (html.indexOf(keyJapaneseString) == -1) {
        if (detectCaptcha(html) == true) {
          const errorType = 'Googleから人間ではなさそうな動きがバレました。次の実行まで待ちましょう'
          console.log(errorType + e)
          return reject(e)
        } else {
          const errorType = 'Googleで確認したら不明なエラーが起きました。ライラに連絡してみよう。'
          console.log(errorType + e)
          console.log(html)
          return reject(e)
        }
      }
    }
  });
}

const scrapeGoogleWebCache = (pageUrl) => {
  console.log('Start Scaping Google')
  console.log(pageUrl)
  const options = {
    url: googleCacheUrl + pageUrl,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
    }
  }
  return new Promise( (resolve,reject) => {
    rp(googleCacheUrl + pageUrl)
      .then(function(html){
        return resolve(html)
      })
      .catch(function(err){
        switch(err.statusCode){
        case 404:
          return resolve("Error 404")
          break;
        case 429:
          return resolve("CAPTCHA")
          break;
        default:
          console.log('Something went wrong when scraping Google: ' + err)
          return reject(err)
          break;
        }
      });
  });
}

function detectCaptcha(html) {
  const unusualTraffic = "Our systems have detected unusual traffic from your computer network."
  if (html.indexOf(unusualTraffic) !== -1) {
    return true
  }
}

module.exports = getCachedDate;
