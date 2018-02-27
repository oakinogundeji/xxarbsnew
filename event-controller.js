'use strict';
if(process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}
//=============================================================================
// dependencies
const
  {fork, spawn} = require('child_process'),
  P = require('puppeteer'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  moment = require('moment'),
  DBURL = process.env.DBURL,
  EventCardModel = require('./models/event-cards'),
  SMARKETS_URL = process.env.SMARKETS_URL,
  BETFAIR_URL = process.env.BETFAIR_URL,
  SMARKETS_EVENTS_CONTAINER_SELECTOR = 'ul.contracts',
  SMARKETS_SELECTIONS_SELECTOR = 'div.contract-info',
  EVENT_END_URL = process.env.EVENT_END_URL,
  HR_EVENT_LINKS_SELECTOR = 'a.race-link',
  GENERIC_EVENT_LINKS_SELECTOR = 'span.event-name';

let
  selectionsList,
  marketControllers = {},
  BETFAIR,
  SMARKETS,
  SPORT,
  EVENT_LABEL,
  TARGETS;
// helper functions

async function getSelections() {
  // setup
  let
    sport,
    flag;
  const URL_ARR = SMARKETS_URL.split('/');
  sport = URL_ARR[6];
  if(sport == 'horse-racing' ) {
    flag = 'HR';
    SPORT = 'horse-racing';
  } else {
    flag = 'GENERIC';
    SPORT = 'generic';
  }
  console.log(`sport: ${sport}...`);
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
  await page.goto(SMARKETS_URL, {
    waitUntil: 'networkidle2',
    timeout: 180000
  });
  await page.waitFor(10*1000);
  // ensure race container selector available
  await page.waitForSelector(SMARKETS_EVENTS_CONTAINER_SELECTOR);
  // allow 'page' instance to output any calls to browser log to node log
  page.on('console', data => console.log(data.text()));
  console.log('SMARKETS_EVENTS_CONTAINER_SELECTOR found, continuing...');
  // get list of selections
  selectionsList = await page.$$eval(SMARKETS_SELECTIONS_SELECTOR, (targets, flag) => {
    let selectionsList = [];
    if(flag == 'HR') {
      targets.filter(target => {
        if(target.parentElement.nextElementSibling.children[0].children[0].className == 'price-section') {
          const selection = target.children[1].children[0].innerText;
          console.log(`selection info for HR: ${selection}`);
          return selectionsList.push(selection);
        }
      });
    } else {
      targets.forEach(target => {
        const selection = target.innerText;
        console.log(`selection info for GENERIC: ${selection}`);
        return selectionsList.push(selection);
      });
    }
    return selectionsList;
  }, flag);
  await browser.close();
  return Promise.resolve(true);
}

async function createEventCard() {

  // setup
  let
    sport,
    eventLabel,
    eventDate,
    EVENT_ARR,
    timeLabel = moment().format('L');
  timeLabel = timeLabel.split('/').reverse().join('-');
  let URL_ARR = SMARKETS_URL.split('/');
  sport = URL_ARR[6];
  if(sport == 'horse-racing' ) {
    EVENT_ARR = URL_ARR.slice(7);
    eventLabel = EVENT_ARR[0] +'|'+ EVENT_ARR[1] +'-'+ EVENT_ARR[2] +'-'+ EVENT_ARR[3] +' '+ EVENT_ARR[4];
    EVENT_LABEL = eventLabel;
  } else {
    const eventName = URL_ARR.pop();
    eventLabel = eventName +'|'+ timeLabel;
    EVENT_LABEL = eventLabel;
  }
  eventDate = EVENT_ARR[1] +'-'+ EVENT_ARR[2] +'-'+ EVENT_ARR[3];
  // create initial EVENT Card
  let eventCard = {
    eventLabel,
    eventDate,
    sport,
    selectionsList,
    country: 'GB',
    outcome: 'WIN'
  };
  console.log('eventCard...');
  console.log(eventCard);
  // create eventCard for event if NOT exists
  const query = EventCardModel.findOne({eventLabel: eventCard.eventLabel, sport: eventCard.sport});
  const alreadyExists = await query.exec();
  if(!!alreadyExists && (alreadyExists.eventLabel == eventCard.eventLabel)) {
    console.log(`${alreadyExists.eventLabel} already exists...`);
    return Promise.resolve({eventLabel: alreadyExists.eventLabel, sport: sport, eventDate: alreadyExists.eventDate});
  } else {
    const newEventCard = new EventCardModel(eventCard);
    const saveNewEventCard = await newEventCard.save();
    if(saveNewEventCard.eventLabel == eventCard.eventLabel) {
      console.log(`successfully created eventCard for ${saveNewEventCard.eventLabel}`);
      return Promise.resolve({eventLabel: saveNewEventCard.eventLabel, sport: sport, eventDate: saveNewEventCard.eventDate});
    } else {
      console.error(`failed to create eventCard for ${eventCard.eventLabel}`);
      const newErr = new Error(`failed to create eventCard for ${eventCard.eventLabel}`);
      return Promise.reject(newErr);
    }
  }
}

function forkMarketController(SELECTION, eventIdentifiers) {
  const SELECTION_INFO = JSON.stringify(eventIdentifiers);
  console.log(`launching MARKET-CONTROLLER for ${SELECTION}...`);
  const cp = fork('./market-controller.js', [SELECTION, SELECTION_INFO]);
  marketControllers[SELECTION] = cp;
  return Promise.resolve(true);
}

function spawnBots() {
  // spawn the BOTS
  console.log(`spawning the streaming bots`);
  spawnBetfairBot();
  spawnSmarketsBot();
  return Promise.resolve(true);
}

function spawnBetfairBot() {

  const regx = /['"]/;

  console.log(`Spawning Betfair BOT`);

  BETFAIR = spawn('node', ['./betfair-hr.js'], {
    stdio: ['pipe', 'ipc', 'pipe']
  });

  // listen for data
  BETFAIR.on('message', data => {
    console.log('data from Betfair...');
    const dataObj = JSON.parse(data);
    let target = dataObj.selection;
    target = target.toLowerCase();
    target = target.replace(regx, '');
    const marketControllerArray = selectionsList.filter(val => {
      let newVal = val.toLowerCase();
      newVal = newVal.replace(regx, '');
      return newVal == target;
    });
    const marketController = marketControllerArray[0];
    marketControllers[marketController].send({
      exchange: 'betfair',
      payload: dataObj});
  });

  BETFAIR.stderr.on('data', err => {
    console.error(`BETFAIR bot err`);
    console.error(err.toString());
    console.log(`terminating existing Betfair BOT`);
    process.kill(BETFAIR.pid);
    console.log(`respawning Betfair BOT`);
    return spawnBetfairBot();
  });

  BETFAIR.on('error', err => {
    console.error(`BETFAIR CP err`);
    console.error(err);
    console.log(`terminating existing Betfair BOT`);
    process.kill(BETFAIR.pid);
    console.log(`respawning Betfair BOT`);
    return spawnBetfairBot();
  });

  BETFAIR.on('close', code => {
    if(code < 1) {
      return console.log(`BETFAIR BOT closed normally...`);
    } else {
      return console.error(`BETFAIR BOT closed abnormally...`);
    }
  });
}

function spawnSmarketsBot() {
  console.log(`Spawning Smarkets BOT`);

  SMARKETS = spawn('node', ['./smarkets-hr.js'], {
    stdio: ['pipe', 'ipc', 'pipe']
  });

  // listen for data

  SMARKETS.on('message', data => {
    console.log('data from Smarkets...');
    const dataObj = JSON.parse(data);
    const marketController = dataObj.selection;
    marketControllers[marketController].send({
      exchange: 'smarkets',
      payload: dataObj});
  });

  SMARKETS.stderr.on('data', err => {
    console.error(`SMARKETS BOT err`);
    console.error(err.toString());
    console.log(`terminating existing Smarkets BOT`);
    process.kill(SMARKETS.pid);
    console.log(`respawning Smarkets BOT`);
    return spawnSmarketsBot();
  });

  SMARKETS.on('error', err => {
    console.error(`SMARKETS CP err`);
    console.error(err);
    console.log(`terminating existing Smarkets BOT`);
    process.kill(SMARKETS.pid);
    console.log(`respawning Smarkets BOT`);
    return spawnSmarketsBot();
  });

  SMARKETS.on('close', code => {
    if(code < 1) {
      return console.log(`SMARKETS BOT closed normally`);
    } else {
      return console.error(`SMARKETS BOT closed abnormally`);
    }
  });
}

// connect to DBURL
let db;
const options = {
  promiseLibrary: Promise,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  poolSize: 10,
  socketTimeoutMS: 0,
  keepAlive: true,
  autoIndex: false
};

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Event-Controller dBase connection closed due to app termination');
    process.exit(0);
  });
});

function connectToDB() {
   return new Promise((resolve, reject) => {
     console.log(`Attempting to connect to ${DBURL}...`);
     mongoose.connect(DBURL, options);
     db = mongoose.connection;
     db.on('error', err => {
       console.error('There was a db connection error');
       return reject('There was an error connecting to mongodb')
     });
     db.once('connected', () => {
       console.info(`Event-Controller successfully connected to ${DBURL}`);
       return resolve(true);
     });
     db.once('disconnected', () => {
       console.info('Event-Controller successfully disconnected from ' + DBURL);
     });
   });
 }

async function listenForCloseEvent(flag) {
 if(flag == 'HR') {
   return listenForHREventClose();
 } else {
   return listenForGenericEventClose();
 }
}

async function listenForHREventClose() {
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
 // navigate to RACE_URL
 await page.goto(EVENT_END_URL, {
   waitUntil: 'networkidle2',
   timeout: 180000
 });
 // wait for 30 secs
 await page.waitFor(30*1000);
 // define checkEventEnd function
 async function checkEventEnd() {
   console.log('checkEventEnd invoked...');
   // get all events on page
   const events = await page.$$eval(HR_EVENT_LINKS_SELECTOR, (events, BETFAIR_URL) => {
     console.log('querying for events...');
     const eventNotEnded = events.filter(event => event.href == BETFAIR_URL);
     console.log('eventNotEnded obj...');
     console.log(eventNotEnded);
     return eventNotEnded;
   }, BETFAIR_URL);
   if(events.length > 0) {// event has NOT ended
     console.log(`event has NOT ended for ${EVENT_LABEL}...`);
     console.log('closing puppeteer browser and rechecking in 5 mins...');
     await browser.close();
     return setTimeout(listenForHREventClose, 300000);// 5 mins timer
   } else {
     console.log(`event has ended for ${EVENT_LABEL}...`);
     console.log('terminating BOTs and market-controller processes...');
     process.kill(BETFAIR.pid);
     //process.kill(SMARKETS.pid);
     const marketControllersKeysArray = Object.keys(marketControllers);
     marketControllersKeysArray.forEach(key => process.kill(marketControllers[key].pid));
     await browser.close();
     return process.exit(0);
   }
 }
 return checkEventEnd();
}

async function listenForGenericEventClose() {
 const sortedTargetsArray = TARGETS.sort();
 const sortedTargetsString = sortedTargetsArray.join(', ');
 console.log('sortedTargetsString');
 console.log(sortedTargetsString);
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
 // navigate to RACE_URL
 await page.goto(EVENT_END_URL, {
   waitUntil: 'networkidle2',
   timeout: 180000
 });
 // wait for 30 secs
 await page.waitFor(30*1000);
 // define checkEventEnd function
 async function checkEventEnd() {
   console.log('checkEventEnd invoked...');
   // get all events on page
   const eventFound = await page.$$eval(GENERIC_EVENT_LINKS_SELECTOR, (events) => {
     console.log('querying for events...');
     const result = events.map(event => {
       let eventTargetsArray = event.innerText.split('vs.');
       let trimmedeventTargetsArray = eventTargetsArray.map(item => item.trim());
       console.log('trimmedeventTargetsArray');
       console.log(trimmedeventTargetsArray);
       trimmedeventTargetsArray.sort();
       let eventTargetsArraySortedString = trimmedeventTargetsArray.join(', ');
       eventTargetsArraySortedString = eventTargetsArraySortedString.trim();
       let eventStatus = event.parentElement.parentElement.children[1].children[0].innerText.toLowerCase();
       return {
         label: eventTargetsArraySortedString,
         status: eventStatus
       };
     });
     console.log('result..');
     console.log(result);
     return result;
   });
   console.log('eventFound');
   console.log(eventFound);
   const ongoing = eventFound.filter(event => event.label == sortedTargetsString);
   console.log('ongoing');
   console.log(ongoing);
   if(!!ongoing[0] && ongoing[0].status != 'event ended') {// event has NOT ended
     console.log(`event has NOT ended for ${EVENT_LABEL}...`);
     console.log('closing puppeteer browser and rechecking in 5 mins...');
     await browser.close();
     return setTimeout(listenForGenericEventClose, 300000);
   } else {
     console.log(`event has ended for ${EVENT_LABEL}...`);
     console.log('terminating BOTs and market-controller processes...');
     process.kill(BETFAIR.pid);
     //process.kill(SMARKETS.pid);
     const marketControllersKeysArray = Object.keys(marketControllers);
     marketControllersKeysArray.forEach(key => process.kill(marketControllers[key].pid));
     await browser.close();
     return process.exit(0);
   }
 }
 return checkEventEnd();
}

connectToDB()
  .then(ok => {
    console.log('getting selections...');
    return getSelections();
  })
  .then(ok => {
    console.log('selectionsList...');
    console.log(selectionsList);
    return Promise.resolve(true);
  })
  .then(ok => createEventCard())
  .then(eventIdentifiers => {
    console.log('all good...');
    console.log('launching MARKET-CONTROLLERs...');
    // create 1 MARKET-CONTROLLER per selection
    if(eventIdentifiers.sport != 'horse-racing') {
      TARGETS = selectionsList.filter(selection => selection.toLowerCase() != 'draw');
      console.log('event-controller closing db connection...');
      db.close();
      return forkMarketController(selectionsList[0], eventIdentifiers);
      //return selectionsList.forEach(selection => forkMarketController(selection, eventIdentifiers));
    } else {
      console.log('event-controller closing db connection...');
      db.close();
      return forkMarketController(selectionsList[0], eventIdentifiers);
      //return selectionsList.forEach(selection => forkMarketController(selection, eventIdentifiers));
    }
  })
  .then(ok => spawnBots())
  .then(ok => {
    console.log('ready to listen for event ended');
    let flag;
    if(SPORT == 'horse-racing') {
      flag = 'HR';
    } else {
      flag = 'GENERIC';
    }
    return listenForCloseEvent(flag);
  })
  .catch(err => console.error(err));
