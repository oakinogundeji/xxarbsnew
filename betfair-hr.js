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
  PWD = process.env.BETFAIR_PWD,
  EVENT_URL = process.env.BETFAIR_URL,
  EVENT_LABEL = process.argv[2],
  EMAIL_SELECTOR = '#ssc-liu',
  PWD_SELECTOR = '#ssc-lipw',
  LOGIN_BTN_SELECTOR = '#ssc-lis',
  SELECTIONS_CONTAINER_SELECTOR = 'div.main-mv-runners-list-wrapper',
  MATCHED_AMOUNT_SELECTOR = '#main-wrapper > div > div.scrollable-panes-height-taker > div > div.page-content.nested-scrollable-pane-parent > div > div.bf-col-xxl-17-24.bf-col-xl-16-24.bf-col-lg-16-24.bf-col-md-15-24.bf-col-sm-14-24.bf-col-14-24.center-column.bfMarketSettingsSpace.bf-module-loading.nested-scrollable-pane-parent > div.scrollable-panes-height-taker.height-taker-helper > div > div.bf-row.main-mv-container > div > bf-main-market > bf-main-marketview > div > div.mv-sticky-header > bf-marketview-header-wrapper > div > div > mv-header > div > div > div.mv-secondary-section > div > div > span.total-matched',
  RACE_START_SELECTOR = '#main-wrapper > div > div.scrollable-panes-height-taker > div > div.page-content.nested-scrollable-pane-parent > div > div.bf-col-xxl-17-24.bf-col-xl-16-24.bf-col-lg-16-24.bf-col-md-15-24.bf-col-sm-14-24.bf-col-14-24.center-column.bfMarketSettingsSpace.bf-module-loading.nested-scrollable-pane-parent > div:nth-child(1) > div > div > div > div > div.event-header > div > span.race-status.default';

const
  EVENT_TIME_ARRAY = EVENT_LABEL.split('|'),
  EVENT_TIME_STR = EVENT_TIME_ARRAY[1];
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
  await page.waitFor(30*1000);
  // wait for EMAIL and PWD selectors to be available
  await page.waitForSelector(EMAIL_SELECTOR, {timeout: 30000});
  await page.waitForSelector(PWD_SELECTOR, {timeout: 30000});
  // enter email
  await page.type(EMAIL_SELECTOR, EMAIL, {delay: 100});
  await page.waitFor(2*1000);
  //enter password
  await page.type(PWD_SELECTOR, PWD, {delay: 100});
  await page.waitFor(2*1000);
  // click login button
  await page.click(LOGIN_BTN_SELECTOR);
  await page.waitFor(30*1000);
  // ensure race container selector available
  await page.waitForSelector(SELECTIONS_CONTAINER_SELECTOR, {
    timeout: 180000
  });
  // allow 'page' instance to output any calls to browser log to process obj
  page.on('console', data => process.send(data.text()));
  // bind to races container and lsiten for updates to , bets etc
  await page.$eval(SELECTIONS_CONTAINER_SELECTOR,
    (target, MATCHED_AMOUNT_SELECTOR, EVENT_TIME_STR, RACE_START_SELECTOR) => {
      // listen for raceStart
      function raceStarts() {
        // get target time from eventLabel and present time
        const
          targetTime = new Date(EVENT_TIME_STR),
          presentTime = new Date(),
          targetTimeValue = targetTime.valueOf(),
          presentTimeValue = presentTime.valueOf(),
          delay = targetTimeValue - presentTimeValue;

        async function verifyRaceStarts() {
          const started = await page.waitForSelector(RACE_START_SELECTOR, {
            timeout: 60000
          });
          if(!!started) {
            const
              msg = {alert: 'race has started'},
              outpt = JSON.stringify(msg);
            return console.log(output);
          }
          else {
            return setTimeout(verifyRaceStarts, 10000);
          }
        }
        return setTimeout(verifyRaceStarts, delay);
      }

      raceStarts();

      target.addEventListener('DOMSubtreeModified', function (e) {
        // check for most common element of back and lay as source of event
        if(e.target.parentElement.parentElement.parentElement.parentElement.className == 'runner-line') {
          // define variables
          let
            betType,
            odds,
            liquidity,
            SELECTION;
           SELECTION = e.target.parentElement.parentElement.parentElement.parentElement.children[0].children[0].children[1].children[0].children[0].children[0].children[2].innerText.split('\n')[0];
          // check if back or lay
          if(e.target.parentElement.parentElement.classList[0] == 'back') { // BACK
            if(e.target.parentElement.parentElement.className == 'back mv-bet-button back-button back-selection-button') {
              betType = 'b0';
              if(e.target.className == 'bet-button-price') {
                odds = e.target.innerText;
                liquidity = e.target.nextElementSibling.innerText;
              }
              else if(e.target.className == 'bet-button-size') {
                liquidity = e.target.innerText;
                odds = e.target.previousElementSibling.innerText;
              }
            }
            else if(e.target.parentElement.parentElement.parentElement.nextElementSibling.className == 'bet-buttons back-cell last-back-cell') {
              betType = 'b1';
              if(e.target.className == 'bet-button-price') {
                odds = e.target.innerText;
                liquidity = e.target.nextElementSibling.innerText;
              }
              else if(e.target.className == 'bet-button-size') {
                liquidity = e.target.innerText;
                odds = e.target.previousElementSibling.innerText;
              }
            }
            else if(e.target.parentElement.parentElement.parentElement.nextElementSibling.nextElementSibling.className == 'bet-buttons back-cell last-back-cell') {
               betType = 'b2';
              if(e.target.className == 'bet-button-price') {
                odds = e.target.innerText;
                liquidity = e.target.nextElementSibling.innerText;
              }
              else if(e.target.className == 'bet-button-size') {
                liquidity = e.target.innerText;
                odds = e.target.previousElementSibling.innerText;
              }
            }
          }
          else if(e.target.parentElement.parentElement.classList[0] == 'lay') { // LAY
            if(e.target.parentElement.parentElement.className == 'lay mv-bet-button lay-button lay-selection-button') {
              betType = 'l0';
              if(e.target.className == 'bet-button-price') {
                odds = e.target.innerText;
                liquidity = e.target.nextElementSibling.innerText;
              }
              else if(e.target.className == 'bet-button-size') {
                liquidity = e.target.innerText;
                odds = e.target.previousElementSibling.innerText;
              }
            }
            else if(e.target.parentElement.parentElement.parentElement.previousElementSibling.className == 'bet-buttons lay-cell first-lay-cell') {
              betType = 'l1';
              if(e.target.className == 'bet-button-price') {
                odds = e.target.innerText;
                liquidity = e.target.nextElementSibling.innerText;
              }
              else if(e.target.className == 'bet-button-size') {
                liquidity = e.target.innerText;
                odds = e.target.previousElementSibling.innerText;
              }
            }
            else if(e.target.parentElement.parentElement.parentElement.previousElementSibling.previousElementSibling.className == 'bet-buttons lay-cell first-lay-cell') {
              betType = 'l2';
              if(e.target.className == 'bet-button-price') {
                odds = e.target.innerText;
                liquidity = e.target.nextElementSibling.innerText;
              }
              else if(e.target.className == 'bet-button-size') {
                liquidity = e.target.innerText;
                odds = e.target.previousElementSibling.innerText;
              }
            }
          }
          if(!!betType && !!odds && !!liquidity && !!SELECTION) {
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
      }
    );
  }, MATCHED_AMOUNT_SELECTOR, EVENT_TIME_STR, RACE_START_SELECTOR);
}

// execute scraper
bot()
  .catch(err => console.error(err));
//=============================================================================
