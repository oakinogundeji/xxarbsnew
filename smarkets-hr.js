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
  MATCHED_AMOUNT_SELECTOR = 'div.contract-group-stats > span > span > span',
  RUNNERS_SELECTOR = 'div.contract-info',
  BET_WIDGET_SELECTOR = 'div.bet-widget-wrapper',
  BET_HEADER_SELECTOR = 'div.bet-header',
  UP_ARROW_SELECTOR = 'div.bet-widget-main-content > div > div:nth-child(1) > div > div.param-input_ticks > a.param-tick.up',
  PRICE_INPUT_SELECTOR = 'div:nth-child(1) > div > div.param > span > input',
  SIZE_INPUT_SELECTOR = 'div:nth-child(2) > div > div.param > span > input',
  SUBMIT_BET_SELECTOR = 'button.confirm-bet-button',
  CONFIRM_SUBMIT_SELECTOR = 'div.bet-widget-wrapper > form > div > div.bet-widget-main-row > div.bet-widget-main-row-right > div.bet-submit > button',
  SCREEN_SHOT_DIR = './screenshots/';


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
            liquidity: Number(liquidity.slice(1)).toFixed(2),
            selection: SELECTION
          };
          const output = JSON.stringify(data);
          console.log(output);
        }
      }
    );
  }, MATCHED_AMOUNT_SELECTOR);

  // implement PLACEBET feature

  async function placeBet(SELECTION, TYPE, TARGET_ODDS, TARGET_LIQUIDITY) {
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
    // ensure runners selector available
    await page.waitForSelector(RUNNERS_SELECTOR, {
      timeout: 180000
    });

    // get RUNNERS
    await page.$$eval(RUNNERS_SELECTOR, (targets, SELECTION, TYPE) => {
      try {
        targets.filter(target => {// filter for SELECTION
          if(target.children[1].children[0].children[0].innerText == SELECTION) {
            if(TYPE == 'bet') {
              target.parentElement.nextElementSibling.children[0].children[0].children[1].children[0].click();
              console.log('clicked bet...');
              return true
            }
            else if(TYPE == 'lay') {
              target.parentElement.nextElementSibling.children[0].children[0].children[2].children[0].click();
              console.log('clicked lay...');
              return true;
            }
            else {
              return false;
            }
          }
        });
      }
      catch(err) {
        return Promise.reject(err);
      }
    }, SELECTION, TYPE);

    // ensure BET_WIDGET_SELECTOR available
    await page.waitForSelector(BET_WIDGET_SELECTOR, {
     timeout: 180000
   });

   // ensure BET_HEADER_SELECTORavailable
   await page.waitForSelector(BET_HEADER_SELECTOR, {
     timeout: 180000
   });

   const runnerName = await page.$eval(BET_HEADER_SELECTOR, (el, SELECTION) => {
     const
       str = el.innerText,
       lowercaseStr = str.toLowerCase(),
       selection = SELECTION.toLowerCase();
     if(lowercaseStr.includes(selection)) {
       return SELECTION;
     }
     else {
       return null;
     }
   }, SELECTION);

   // confirm runnerName == SELECTION

   if(runnerName == SELECTION) {
     // ensure UP_ARROW_SELECTOR available
     await page.waitForSelector(UP_ARROW_SELECTOR, {
       timeout: 180000
     });
     // click on UP_ARROW_SELECTOR once
     await page.click(UP_ARROW_SELECTOR);
     // ensure PRICE_INPUT_SELECTOR available
     await page.waitForSelector(PRICE_INPUT_SELECTOR, {
       timeout: 180000
     });
     // set value of PRICE_INPUT_SELECTOR to TARGET_LIQUIDITY
     await page.$eval(PRICE_INPUT_SELECTOR, (el, TARGET_LIQUIDITY) => el.value = TARGET_LIQUIDITY, TARGET_LIQUIDITY);
     // ensure SIZE_INPUT_SELECTOR available
     await page.waitForSelector(SIZE_INPUT_SELECTOR, {
       timeout: 180000
     });
     // set value of SIZE_INPUT_SELECTOR to TARGET_ODDS
     await page.$eval(SIZE_INPUT_SELECTOR, (el, TARGET_ODDS) => el.value = TARGET_ODDS, TARGET_ODDS);
     // ensure SUBMIT_BET_SELECTOR available
     await page.waitForSelector(SUBMIT_BET_SELECTOR, {
       timeout: 180000
     });
     // click
     await page.click(SUBMIT_BET_SELECTOR);
     // ensure CONFIRM_SUBMIT_SELECTOR available
     await page.waitForSelector(CONFIRM_SUBMIT_SELECTOR, {
       timeout: 180000
     });
     // click
     await page.click(CONFIRM_SUBMIT_SELECTOR);
     // wait 10 secs for results to be displayed
     await page.waitFor(10*1000);
     // take screenshot
     let timestamp = new Date();
     timestamp = timestamp.toISOString();
     const screenshotFile = `${SCREEN_SHOT_DIR}smarkets-${SELECTION}-${TYPE}-${timestamp}.png`;
     const info = `${TYPE} ${SELECTION}`;
     await page.screenshot({
        path: screenshotFile,
        fullPage: true
      });
      // send msg to fire email
      const msg = {
        info,
        screenshot: screenshotFile
      };
    const output = JSON.stringify(msg);
    console.log(output);
     // CLOSE IN 10 SECS
     setTimeout(() => page.close(), 10000);
   }
   else {
     const err = new Error('runnerName != SELECTION');
     return Promise.reject(err);
   }
  }

  process.on('message', data => {
    const {selection, type, odds, liquidity} = data;
    return placeBet(selection, type, odds, 2.00);
    //return placeBet(selection, type, odds, liquidity);
  });
}

// execute scraper
bot()
  .catch(err => console.error(err));
//=============================================================================
