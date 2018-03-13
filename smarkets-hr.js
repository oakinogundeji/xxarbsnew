/**
 * created by Muyi on 12-01-2018
 */
//=============================================================================
'use strict';
if(process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}
//=============================================================================
// dependencies
const P = require('puppeteer');

// module variables
const
  EMAIL = process.env.EMAIL,
  PWD = process.env.SMARKETS_PWD,
  EVENT_URL = process.env.SMARKETS_URL,
  ACCESS_LOGIN_SELECTOR = '#header-login',
  EMAIL_SELECTOR = '#login-form-email',
  PWD_SELECTOR = '#login-form-password',
  SHOW_PWD_SELECTOR = '#login-page > div.form-page-content > form > div:nth-child(2) > div > div > span.after > button',
  SIGNIN_BTN_SELECTOR = '#login-page > div.form-page-content > form > button',
  SELECTIONS_CONTAINER_SELECTOR = 'ul.contracts',
  MATCHED_AMOUNT_SELECTOR = 'div.contract-group-stats > span > span > span';


// define scraper function

async function bot() {
  // instantiate browser
  const browser = await P.launch({
    headless: false,
    timeout: 180000
  });
  // create blank page
  const page = await browser.newPage();
  // set viewport to 1366*768
  await page.setViewport({width: 1366, height: 768});
  // set the user agent
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)');
  // navigate to EVENT_URL
  await page.goto(EVENT_URL, {
    waitUntil: 'networkidle2',
    timeout: 180000
  });
  // ensure ACCESS_LOGIN_SELECTOR is available
  await page.waitForSelector(ACCESS_LOGIN_SELECTOR);
  // click the button to access login
  await page.click(ACCESS_LOGIN_SELECTOR);
  // wait for EMAIL and PWD selectors to be available
  await page.waitForSelector(EMAIL_SELECTOR);
  await page.waitForSelector(PWD_SELECTOR);
  // enter email
  await page.type(EMAIL_SELECTOR, EMAIL, {delay: 100});
  await page.waitFor(2*1000);
  // click show pwd btn
  await page.click(SHOW_PWD_SELECTOR);
  //enter password
  await page.type(PWD_SELECTOR, PWD, {delay: 100});
  await page.waitFor(2*1000);
  // click login button
  await page.click(SIGNIN_BTN_SELECTOR);
  await page.waitFor(30*1000);
  // ensure race container selector available
  await page.waitForSelector(SELECTIONS_CONTAINER_SELECTOR, {
    timeout: 180000
  });
  // allow 'page' instance to output any calls to browser log to process obj
  page.on('console', data => process.send(data.text()));
  // bind to races container and lsiten for updates to odds, bets etc
  await page.$eval(SELECTIONS_CONTAINER_SELECTOR,
    (target, MATCHED_AMOUNT_SELECTOR) => {
      target.addEventListener('DOMSubtreeModified', function (e) {
        // define variables
        let
          betType,
          odds,
          liquidity,
          SELECTION;
        // check 12 conditions
        // LIQUIDITY conditions
        if((e.target.parentElement.className == 'formatted-currency numeric-value') && (e.target.parentElement.parentElement.parentElement.className == 'level-0 tick') && (e.target.parentElement.parentElement.parentElement.parentElement.className == 'prices offers')) {
          betType = 'b0';
          odds = e.target.parentElement.parentElement.parentElement.children[0].innerText;
          liquidity =e.target.parentElement.innerText;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].innerText;
        }
        else if((e.target.parentElement.className == 'formatted-currency numeric-value') && (e.target.parentElement.parentElement.parentElement.className == 'level-0 tick') && (e.target.parentElement.parentElement.parentElement.parentElement.className == 'prices bids')) {
          betType = 'l0';
          odds = e.target.parentElement.parentElement.parentElement.children[0].innerText;
          liquidity = e.target.parentElement.innerText;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].innerText;
        }
        else if((e.target.parentElement.className == 'formatted-currency numeric-value') && (e.target.parentElement.parentElement.parentElement.className == 'level-1 tick') && (e.target.parentElement.parentElement.parentElement.parentElement.className == 'prices offers')) {
          betType = 'b1';
          odds = e.target.parentElement.parentElement.parentElement.children[0].innerText;
          liquidity = e.target.parentElement.innerText;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].innerText;
        }
        else if((e.target.parentElement.className == 'formatted-currency numeric-value') && (e.target.parentElement.parentElement.parentElement.className == 'level-1 tick') && (e.target.parentElement.parentElement.parentElement.parentElement.className == 'prices bids')) {
          betType = 'l1';
          odds = e.target.parentElement.parentElement.parentElement.children[0].innerText;
          liquidity = e.target.parentElement.innerText;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].innerText;
        }
        else if((e.target.parentElement.className == 'formatted-currency numeric-value') && (e.target.parentElement.parentElement.parentElement.className == 'level-2 tick') && (e.target.parentElement.parentElement.parentElement.parentElement.className == 'prices offers')) {
          betType = 'b2';
          odds = e.target.parentElement.parentElement.parentElement.children[0].innerText;
          liquidity = e.target.parentElement.innerText;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].innerText;
        }
        else if((e.target.parentElement.className == 'formatted-currency numeric-value') && (e.target.parentElement.parentElement.parentElement.className == 'level-2 tick') && (e.target.parentElement.parentElement.parentElement.parentElement.className == 'prices bids')) {
          betType = 'l2';
          odds = e.target.parentElement.parentElement.parentElement.children[0].innerText;
          liquidity = e.target.parentElement.innerText;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].innerText;
        }
        // ODDS conditions
        else if((e.target.parentElement.className == 'formatted-price numeric-value') && (e.target.parentElement.parentElement.parentElement.parentElement.className == 'level-0 tick') && (e.target.parentElement.parentElement.parentElement.parentElement.parentElement.className == 'prices offers')) {
          betType = 'b0';
          odds = e.target.parentElement.innerText;
          liquidity = e.target.parentElement.parentElement.parentElement.parentElement.children[1].innerText;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].innerText;
        }
        else if((e.target.parentElement.className == 'formatted-price numeric-value') && (e.target.parentElement.parentElement.parentElement.parentElement.className == 'level-0 tick') && (e.target.parentElement.parentElement.parentElement.parentElement.parentElement.className == 'prices bids')) {
          betType = 'l0';
          odds = e.target.parentElement.innerText;
          liquidity = e.target.parentElement.parentElement.parentElement.parentElement.children[1].innerText;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].innerText;
        }
        else if((e.target.parentElement.className == 'formatted-price numeric-value') && (e.target.parentElement.parentElement.parentElement.parentElement.className == 'level-1 tick') && (e.target.parentElement.parentElement.parentElement.parentElement.parentElement.className == 'prices offers')) {
          betType = 'b1';
          odds = e.target.parentElement.innerText;
          liquidity = e.target.parentElement.parentElement.parentElement.parentElement.children[1].innerText;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].innerText;
        }
        else if((e.target.parentElement.className == 'formatted-price numeric-value') && (e.target.parentElement.parentElement.parentElement.parentElement.className == 'level-1 tick') && (e.target.parentElement.parentElement.parentElement.parentElement.parentElement.className == 'prices bids')) {
          betType = 'l1';
          odds = e.target.parentElement.innerText;
          liquidity = e.target.parentElement.parentElement.parentElement.parentElement.children[1].innerText;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].innerText;
        }
        else if((e.target.parentElement.className == 'formatted-price numeric-value') && (e.target.parentElement.parentElement.parentElement.parentElement.className == 'level-2 tick') && (e.target.parentElement.parentElement.parentElement.parentElement.parentElement.className == 'prices offers')) {
          betType = 'b2';
          odds = e.target.parentElement.innerText;
          liquidity = e.target.parentElement.parentElement.parentElement.parentElement.children[1].innerText;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].innerText;
        }
        else if((e.target.parentElement.className == 'formatted-price numeric-value') && (e.target.parentElement.parentElement.parentElement.parentElement.className == 'level-2 tick') && (e.target.parentElement.parentElement.parentElement.parentElement.parentElement.className == 'prices bids')) {
          betType = 'l2';
          odds = e.target.parentElement.innerText;
          liquidity = e.target.parentElement.parentElement.parentElement.parentElement.children[1].innerText;
          SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].innerText;
        }
        if(!!betType && !!odds && !!liquidity && SELECTION) {
          let timestamp = new Date();
          timestamp = timestamp.toISOString();
          let matchedAmount = document.querySelector(MATCHED_AMOUNT_SELECTOR).innerText;
          matchedAmount = Number(matchedAmount.replace(/\D/g, ''));
          const data = {
            betType,
            matchedAmount,
            timestamp,
            odds: Number(odds),
            liquidity: Number(liquidity.slice(1)),
            selection: SELECTION
          };
          const output = JSON.stringify(data);
          console.log(output);
        }
      }
    );
  }, MATCHED_AMOUNT_SELECTOR);
}

// execute scraper
bot()
  .catch(err => console.error(err));
//=============================================================================
