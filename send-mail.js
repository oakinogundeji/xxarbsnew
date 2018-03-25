'use strict';
if(process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}
//=============================================================================
// dependencies
const
  axios = require('axios'),
  Promise = require('bluebird'),
  {promisify} = require('util'),
  fs = require('fs'),
  unlinkFileAsync = promisify(fs.unlink)
  MSG_EMAIL = 'simon@percayso.com, paul@percayso.com',
  //MSG_EMAIL = 'oakinogundeji@gmail.com',
  ENDPOINT = process.env.ENDPOINT;

// define mail sender function
function sendEmail(subject, body, SCREENSHOT_FILE) {
  return axios.post(ENDPOINT, {
    "transport": "ses",
    "from": "noreply@valueservices.uk",
    "to": MSG_EMAIL,
    "subject": subject,
    "emailbody": body,
    "templateName": "GenericEmail"
  }, {headers: {'Accept': 'application/json'}})
  .then(async (resp) => {
    if(!!SCREENSHOT_FILE) {
      // delete screenshot
      const deletedScreenshot = await unlinkFileAsync(SCREENSHOT_FILE);
      log.info('msg sending response...');
      log.info(resp.statusCode);
      log.info(`The process uses approximately ${used} MB`);
      return Promise.resolve(true);
    }
    else {
      log.info('msg sending response...');
      log.info(resp.statusCode);
      log.info(`The process uses approximately ${used} MB`);
      return Promise.resolve(true);
    }
  })
  .catch(err => {
    log.error('email sending err...');
    log.error(err);
    return Promise.reject(err);
  });
}

// export module
module.exports = function (subject, body, SCREENSHOT_FILE) {
  return sendEmail(subject, body, SCREENSHOT_FILE);
};
//=============================================================================
