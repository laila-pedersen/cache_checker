const rp = require('request-promise');
const cheerio = require('cheerio');

const sonetQueryUrl  = 'https://www.so-net.ne.jp/search/web/?query=site:'

const checkCache = async (pageUrl) => {
  console.log('Start checking for cache')
  const html = await scrapeSonet(pageUrl)

  if (pageUrl.slice(-1) === "/") {
    pageUrl.slice(0, -1)
  }

  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html)
      const resultArea = $('.result-area').not('.pertain-ad').html()
      const hrefString = `href=\"${pageUrl}\"`

      if (resultArea.indexOf(hrefString) !== -1){
        return resolve("OK")
      }
      return resolve("NG")

    } catch (e) {
      console.log("A problem occured while trying to scrape So-net: " + e)
      return reject(e)
    }
  })
}

const scrapeSonet = (pageUrl) => {
  console.log('Start scraping Sonet')
  console.log(pageUrl)
  return new Promise((resolve, reject) => {
    rp(sonetQueryUrl + pageUrl)
      .then((html) => {
        return resolve(html)
      })
      .catch((err) => {
        console.log('Something went wrong while trying to connect to So-net: ' + err)
        return reject(err)
      })
  })
}


module.exports = checkCache;
