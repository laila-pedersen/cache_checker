const fs = require('fs');
const moment = require('moment')
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

function getPagesFromSheet() {
  return new Promise( (resolve,reject) => {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), getListOfPages);
    });

    function getListOfPages(auth) {
      const sheets = google.sheets({version: 'v4', auth});
      sheets.spreadsheets.values.get({
        spreadsheetId: '1I8lAWNhnFW8OgWh2caS1Bgv8L9A8b3NqPY4iAB-JHTU',
        range: 'Page Data!A2:A',
      },  (err, response) => {
        if (err) return reject(console.log('The API returned an error: ' + err));
        const rows = response.data.values;
        if (rows.length) {
          resolve({pages: rows})
        } else {
          console.log('No data found.');
          reject()
        }
      });
    }
  });
}


function writeSheet(values) {
  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), writeRequest);
  });

  function writeRequest(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    const today = moment().format('YYYY-MM-DD');
    sheets.spreadsheets.values.append({
      spreadsheetId: '1I8lAWNhnFW8OgWh2caS1Bgv8L9A8b3NqPY4iAB-JHTU',
      range: today + "!A:E",
      valueInputOption: 'RAW',
      requestBody: {
        values: values
      }
    })
  }
}

function createSheet() {
  return new Promise( (resolve,reject) => {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), createRequest);
    });

  function createRequest(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    const today = moment().format('YYYY-MM-DD');
    sheets.spreadsheets.batchUpdate({
      spreadsheetId: '1I8lAWNhnFW8OgWh2caS1Bgv8L9A8b3NqPY4iAB-JHTU',
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: today,
                gridProperties: {
                  rowCount: 20,
                  columnCount: 5
                },
              }
            }
          }
        ],
      }
    }, (err, response) => {
      if (err) {
        if (err.message.includes('already exists')) return resolve()
        return reject(err)
      }
      const firstRow = [["URL", "Google Cache Date", "Days Since", "So-net"]]
      writeSheet(firstRow)
      return resolve()
    })
  }
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

module.exports.createSheet = createSheet;
module.exports.writeSheet = writeSheet;
module.exports.getPagesFromSheet = getPagesFromSheet;
