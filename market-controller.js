'use strict';
if(process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}
//=============================================================================
const
  Promise = require('bluebird'),
  accounting = require('accounting'),
  mongoose = require('mongoose'),
  request = require('superagent'),
  SelectionDocModel = require('./models/selection-docs'),
  SelectionArbsDocModel = require('./models/selection-arbs-docs'),
  SELECTION = process.argv[2],
  eventIdentifiers = JSON.parse(process.argv[3]),
  EVENT_LABEL = eventIdentifiers.eventLabel,
  SPORT = eventIdentifiers.sport,
  EVENT_DATE = eventIdentifiers.eventDate,
  DBURL = process.env.DBURL;

let arbTrigger = {
  betfair: {
    l0: {
      odds: null, liquidity: null
    },
    b0: {
      odds: null, liquidity: null
    },
  },
  smarkets: {
    l0: {
      odds: null, liquidity: null
    },
    b0: {
      odds: null, liquidity: null
    },
  }
};

let
  betfairDeltas = {
    b0: null,
    b1: null,
    b2: null,
    l0: null,
    l1: null,
    l2: null,
    matchedAmount: null
  },
  smarketsDeltas = {
    b0: null,
    b1: null,
    b2: null,
    l0: null,
    l1: null,
    l2: null,
    matchedAmount: null
  };

let BETFAIR;
let SMARKETS;
let currentArb;


// helper functions
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
    console.log('Selection dBase connection closed due to app termination');
    process.exit(0);
  });
});

process.on('message', data => {
  //console.log(`got msg from event-controller.. resp: ${SELECTION}`);

  const dataObj = JSON.parse(data);
  console.log(`Market controller for ${SELECTION} received data from event-controller`);
  console.log(dataObj);
  //process.exit(0);
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
       console.info(`Market Controller successfully connected to ${DBURL}`);
       return resolve(true);
     });
     db.once('disconnected', () => {
       console.log('Market Controller successfully disconnected from ' + DBURL);
     });
   });
 }

async function createSelectionDeltaDoc() {
  let selectionDoc = {
    eventLabel: EVENT_LABEL,
    eventDate: EVENT_DATE,
    selection: SELECTION,
    b: [],
    s: []
  };

  // create selectionDoc for selection if NOT exists
  const query = SelectionDocModel.findOne({eventLabel: EVENT_LABEL, selection: SELECTION});
  const foundDoc = await query.exec();
  if(!!foundDoc && (foundDoc.eventLabel == selectionDoc.eventLabel) && (foundDoc.selection == selectionDoc.selection)) {
    console.log(`${foundDoc.selection} for ${foundDoc.eventLabel} already exists...`);
    console.log(foundDoc);
    return Promise.resolve(true);
  } else {
    const newSelectionDoc = new SelectionDocModel(selectionDoc);
    const saveNewSelectionDoc = await newSelectionDoc.save();
    if((saveNewSelectionDoc.eventLabel == selectionDoc.eventLabel) && (saveNewSelectionDoc.selection == selectionDoc.selection)) {
      console.log(`successfully created selectionDoc for ${saveNewSelectionDoc.selection} on ${saveNewSelectionDoc.eventLabel}`);
      console.log(saveNewSelectionDoc);
      return Promise.resolve(true);
    } else {
      console.error(`failed to create selectionDoc for ${saveNewSelectionDoc.selection} on ${selectionDoc.eventLabel}`);
      const newErr = new Error(`failed to create selectionDoc for ${saveNewSelectionDoc.selection} on ${selectionDoc.eventLabel}`);
      return Promise.reject(newErr);
    }
  }
}

async function createSelectionArbsDoc() {
  let selectionArbsDoc = {
    eventLabel: EVENT_LABEL,
    eventDate: EVENT_DATE,
    selection: SELECTION,
    arbs: []
  };
  const query = SelectionArbsDocModel.findOne({eventLabel: EVENT_LABEL, selection: SELECTION});
  const foundDoc = await query.exec();
  if(!!foundDoc && (foundDoc.eventLabel == selectionArbsDoc.eventLabel) && (foundDoc.selection == selectionArbsDoc.selection)) {
    console.log(`${foundDoc.selection} for ${foundDoc.eventLabel} arbs doc already exists...`);
    console.log(foundDoc);
    return Promise.resolve(true);
  } else {
    const newSelectionArbsDoc = new SelectionArbsDocModel(selectionArbsDoc);
    const saveNewSelectionArbsDoc = await newSelectionArbsDoc.save();
    if((saveNewSelectionArbsDoc.eventLabel == selectionArbsDoc.eventLabel) && (saveNewSelectionArbsDoc.selection == selectionArbsDoc.selection)) {
      console.log(`successfully created selectionArbsDoc for ${saveNewSelectionArbsDoc.selection} on ${saveNewSelectionArbsDoc.eventLabel}`);
      console.log(saveNewSelectionArbsDoc);
      return Promise.resolve(true);
    } else {
      console.error(`failed to create selectionArbsDoc for ${saveNewSelectionArbsDoc.selection} on ${saveNewSelectionArbsDoc.eventLabel}`);
      const newErr = new Error(`failed to create selectionArbsDoc for ${saveNewSelectionArbsDoc.selection} on ${saveNewSelectionArbsDoc.eventLabel}`);
      return Promise.reject(newErr);
    }
  }
}

async function saveData(exchange, data) {
  // check which exchange is reporting the data
  if(exchange == 'betfair') {
    return saveBetfairData(data);
  }else if(exchange == 'smarkets') {
    return saveSmarketsData(data);
  }
}

async function saveBetfairData(data) {
  if(!betfairDeltas[data.betType]) {// check if first time cell seen
    betfairDeltas[data.betType] = {
      odds: data.odds,
      liquidity: data.liquidity
    };
    betfairDeltas.matchedAmount = data.matchedAmount;
    return saveData(data);
  } else {// cell already exists
    // check if matched amount has changed
    if(betfairDeltas.matchedAmount == data.matchedAmount) {// has NOT changed don't save new matchedAmount
    delete data.matchedAmount;
    } else {// has changed, update betfairDeltas.matchedAmount and save new matchedAmount
    betfairDeltas.matchedAmount = data.matchedAmount;
    }
    // save new info for betfairDeltas
    betfairDeltas[data.betType] = {
      odds: data.odds,
      liquidity: data.liquidity
    };
    return saveData(data);
  }

  async function saveData(data) {
    // push data obj into 'betfair' array
    const query = SelectionDocModel.findOneAndUpdate({eventLabel: EVENT_LABEL, selection: SELECTION}, {$push: {
        b: data
      }});
    try{
      const addedNewBetfairData = await query.exec();
      console.log('addedNewBetfairData...');
      console.log(addedNewBetfairData);
      return Promise.resolve(true);
    } catch(err) {
      console.error('failed to update new betfair data...');
      const newErr = new Error(`failed to update new betfair data... for ${SELECTION}`);
      return Promise.reject(newErr);
    }
  }
}

async function saveSmarketsData(data) {
  if(!smarketsDeltas[data.betType]) {// check if first time cell seen
    smarketsDeltas[data.betType] = {
      odds: data.odds,
      liquidity: data.liquidity
    };
    smarketsDeltas.matchedAmount = data.matchedAmount;
    return saveData(data);
  } else {// cell already exists
    // check if matched amount has changed
    if(smarketsDeltas.matchedAmount == data.matchedAmount) {// has NOT changed don't save new matchedAmount
    delete data.matchedAmount;
    } else {// has changed, update smarketsDeltas.matchedAmount and save new matchedAmount
    smarketsDeltas.matchedAmount = data.matchedAmount;
    }
    // save new info for smarketsDeltas
    smarketsDeltas[data.betType] = {
      odds: data.odds,
      liquidity: data.liquidity
    };
    return saveData(data);
  }

  async function saveData(data) {
    // push data obj into 'smarkets' array
    const query = SelectionDocModel.findOneAndUpdate({eventLabel: EVENT_LABEL, selection: SELECTION}, {$push: {
        s: data
      }});
    try{
      const addedNewSmarketsData = await query.exec();
      console.log('addedNewSmarketsData...');
      console.log(addedNewSmarketsData);
      return Promise.resolve(true);
    } catch(err) {
      console.error('failed to update new smarkets data...');
      const newErr = new Error(`failed to update new smarkets data... for ${SELECTION}`);
      return Promise.reject(newErr);
    }
  }
}

async function checkForArbs(exchange, data) {
  console.log(`checkForArbs invoked for ${exchange}`);
  if((exchange == 'betfair') && ((data.betType == 'b0') || (data.betType == 'l0'))) {
    if(data.betType == 'b0') {// check if b0
      if(!arbTrigger.smarkets.l0.odds) {// check if smarkets l0 odds not initialized
        arbTrigger.betfair.b0 = {
          odds: data.odds,
          liquidity: data.liquidity
        };
        console.log('betfair b0 seen - no smarkets l0');
        return console.log(arbTrigger);
      }
      else {// check if arbs candidate exists
        const
          B0O = data.odds,
          B0L = data.liquidity,
          L0O = arbTrigger.smarkets.l0.odds,
          L0L = arbTrigger.smarkets.l0.liquidity;
        if((B0O > L0O) && ((B0O / L0O) > 1.02)) {// candidate exists
          console.log('candidate arb seen triggered by betfair b0...');
          // create shallow copy of both betfairDeltas and smarketsDeltas
          let
            B = Object.assign({}, betfairDeltas),
            S = Object.assign({}, smarketsDeltas);
          console.log('created shallow copies of betfairDeltas and smarketsDeltas...');
          // update the B.b0 to new values
          B.b0 = {
            odds: B0O,
            liquidity: B0L
          };
          // update the S.l0 to new values
          S.l0 = {
            odds: L0O,
            liquidity: L0L
          };
          console.log('B:..');
          console.log(B);
          console.log('S:..');
          console.log(S);
          // derive target liquidity and win amount
          let targetLiquidity;
          if(B0L > L0L) {
            targetLiquidity = L0L;
          }
          else {
            targetLiquidity = B0L;
          }
          let WINAMT = (targetLiquidity * B0O * 0.98) - (targetLiquidity * L0O);
          let LOSEAMT = ((targetLiquidity * 0.98) - (targetLiquidity)) * (-1);
          //WINAMT = Number(WINAMT.toFixed(2));
          WINAMT = accounting.formatMoney(Number(WINAMT.toFixed(2)), "£ ");
          //LOSEAMT = Number(LOSEAMT.toFixed(2));
          LOSEAMT = accounting.formatMoney(Number(LOSEAMT.toFixed(2)), "£ ");

          // create arbsDoc object
          const arbsDoc = {
            selection: SELECTION,
            timestampFrom: data.timestamp,
            summary: `Bet ${SELECTION} on Betfair for £${targetLiquidity} at ${B0O}, Lay on Smarkets for £${targetLiquidity} at ${L0O}. Win Amount: ${WINAMT}. Lose Amount: ${LOSEAMT}`,
            b: B,
            s: S
          };
          // update in memory arbTrigger with new betfair.b0 values
          arbTrigger.betfair.b0 = {
            odds: B0O,
            liquidity: B0L
          };
          console.log('betfair b0.. arbTrigger');
          console.log(arbTrigger);
          console.log('arbsDoc...');
          console.log(arbsDoc);
          // save the arbDoc
          return saveArbs(arbsDoc);
        }
        else {// candidate does NOT exist
          if(!!currentArb && !currentArb.timestampTo) {// check if any arbs in play
            console.log('terminating inplay currentArb due to betfair b0...');
            console.log(currentArb);
            // update in memory arbTrigger with new smarkets.l0 values
            arbTrigger.betfair.b0 = {
              odds: data.odds,
              liquidity: data.liquidity
            };
            console.log('updated arbTrigger due to no arbs but inplay currentArb via betfair b0...');
            console.log(arbTrigger);
            // end in-play arbs
            return endcurrentArb(data.timestampFrom);
          }
          else {// no currenArbs in play
            // update in memory arbTrigger with new betfair.b0 values
            arbTrigger.betfair.b0 = {
              odds: data.odds,
              liquidity: data.liquidity
            };
            console.log('updated arbTrigger due to no arbs n no inplay currentArb via betfair b0...');
            return console.log(arbTrigger);
          }
        }
      }
    }
    else if(data.betType == 'l0') {// check if l0
      if(!arbTrigger.smarkets.b0.odds) {// check if smarkets b0 not initialized
        arbTrigger.betfair.l0 = {
          odds: data.odds,
          liquidity: data.liquidity
        };
        console.log('betfair l0 seen - no smarkets b0');
        return console.log(arbTrigger);
      }
      else {// check if arbs candidate exists
        const
          L0O = data.odds,
          L0L = data.liquidity,
          B0O = arbTrigger.smarkets.b0.odds,
          B0L = arbTrigger.smarkets.b0.liquidity;
        if((B0O > L0O) && ((B0O / L0O) > 1.02)) {// candidate exists
          console.log('candidate arb seen triggered by betfair l0...');
          // create shallow copy of both betfairDeltas and smarketsDeltas
          let
            B = Object.assign({}, betfairDeltas),
            S = Object.assign({}, smarketsDeltas);
          console.log('created shallow copies of betfairDeltas and smarketsDeltas...');
          // update the B.l0 to new values
          B.l0 = {
            odds: L0O,
            liquidity: L0L
          };
          // update the S.b0 to new values
          S.b0 = {
            odds: B0O,
            liquidity: B0L
          };
          console.log('B:..');
          console.log(B);
          console.log('S:..');
          console.log(S);
          // derive target liquidity and win amount
          let targetLiquidity;
          if(B0L > L0L) {
            targetLiquidity = L0L;
          }
          else {
            targetLiquidity = B0L;
          }
          let WINAMT = (targetLiquidity * B0O * 0.98) - (targetLiquidity * L0O);
          let LOSEAMT = ((targetLiquidity * 0.98) - (targetLiquidity)) * (-1);
          WINAMT = accounting.formatMoney(Number(WINAMT.toFixed(2)), "£ ");
          LOSEAMT = accounting.formatMoney(Number(LOSEAMT.toFixed(2)), "£ ");

          // create arbsDoc object
          const arbsDoc = {
            selection: SELECTION,
            timestampFrom: data.timestamp,
            summary: `Bet ${SELECTION} on Smarkets for £${targetLiquidity} at ${B0O}, Lay on Betfair for £${targetLiquidity} at ${L0O}. Win Amount: ${WINAMT}. Lose Amount: ${LOSEAMT}`,
            b: B,
            s: S
          };
          // update in memory arbTrigger with new betfair.l0 values
          arbTrigger.betfair.l0 = {
            odds: L0O,
            liquidity: L0L
          };
          console.log('betfair l0.. arbTrigger');
          console.log(arbTrigger);
          console.log('arbsDoc...');
          console.log(arbsDoc);
          // save the arbDoc
          return saveArbs(arbsDoc);
        }
        else {// candidate does NOT exist
          if(!!currentArb && !currentArb.timestampTo) {// check if any arbs in play
            console.log('terminating inplay currentArb due to betfair l0...');
            console.log(currentArb);
            // update in memory arbTrigger with new smarkets.l0 values
            arbTrigger.betfair.l0 = {
              odds: data.odds,
              liquidity: data.liquidity
            };
            console.log('updated arbTrigger due to no arbs but inplay currentArb via betfair l0...');
            console.log(arbTrigger);
            // end in-play arbs
            return endcurrentArb(data.timestampFrom);
          }
          else {// no currenArbs in play
            // update in memory arbTrigger with new betfair.l0 values
            arbTrigger.betfair.l0 = {
              odds: data.odds,
              liquidity: data.liquidity
            };
            console.log('updated arbTrigger due to no arbs n no inplay currentArb via betfair l0...');
            return console.log(arbTrigger);
          }
        }
      }
    }
  }
  else if((exchange == 'smarkets') && ((data.betType == 'b0') || (data.betType == 'l0'))) {
    if(data.betType == 'b0') {// check if b0
      if(!arbTrigger.betfair.l0.odds) {// check if betfair l0 not initialized
        arbTrigger.smarkets.b0 = {
          odds: data.odds,
          liquidity: data.liquidity
        };
        console.log('smarkets b0 seen - no betfair l0');
        return console.log(arbTrigger);
      }
      else {// check if arbs candidate exists
        const
          B0O = data.odds,
          B0L = data.liquidity,
          L0O = arbTrigger.betfair.l0.odds,
          L0L = arbTrigger.betfair.l0.liquidity;
        if((B0O > L0O) && ((B0O / L0O) > 1.02)) {// candidate exists
          console.log('candidate arb seen triggered by smarkets b0...');
          // create shallow copy of both betfairDeltas and smarketsDeltas
          let
            B = Object.assign({}, betfairDeltas),
            S = Object.assign({}, smarketsDeltas);
          console.log('created shallow copies of betfairDeltas and smarketsDeltas...');
          // update the B.l0 to new values
          B.l0 = {
            odds: L0O,
            liquidity: L0L
          };
          // update the S.b0 to new values
          S.b0 = {
            odds: B0O,
            liquidity: B0L
          };
          console.log('B:..');
          console.log(B);
          console.log('S:..');
          console.log(S);
          // derive target liquidity and win amount
          let targetLiquidity;
          if(B0L > L0L) {
            targetLiquidity = L0L;
          }
          else {
            targetLiquidity = B0L;
          }
          let WINAMT = (targetLiquidity * B0O * 0.98) - (targetLiquidity * L0O);
          let LOSEAMT = ((targetLiquidity * 0.98) - (targetLiquidity)) * (-1);
          WINAMT = accounting.formatMoney(Number(WINAMT.toFixed(2)), "£ ");
          LOSEAMT = accounting.formatMoney(Number(LOSEAMT.toFixed(2)), "£ ");

          // create arbsDoc object
          const arbsDoc = {
            selection: SELECTION,
            timestampFrom: data.timestamp,
            summary: `Bet ${SELECTION} on Smarkets for £${targetLiquidity} at ${B0O}, Lay on Betfair for £${targetLiquidity} at ${L0O}. Win Amount: ${WINAMT}. Lose Amount: ${LOSEAMT}`,
            b: B,
            s: S
          };
          // update in memory arbTrigger with new smarkets.b0 values
          arbTrigger.smarkets.b0 = {
            odds: B0O,
            liquidity: B0L
          };
          console.log('smarkets b0.. arbTrigger');
          console.log(arbTrigger);
          console.log('arbsDoc...');
          console.log(arbsDoc);
          // save the arbDoc
          return saveArbs(arbsDoc);
        }
        else {// candidate does NOT exist
          if(!!currentArb && !currentArb.timestampTo) {// check if any arbs in play
            console.log('terminating inplay currentArb due to smarkets b0...');
            console.log(currentArb);
            // update in memory arbTrigger with new smarkets.l0 values
            arbTrigger.smarkets.b0 = {
              odds: data.odds,
              liquidity: data.liquidity
            };
            console.log('updated arbTrigger due to no arbs but inplay currentArb via smarkets b0...');
            console.log(arbTrigger);
            // end in-play arbs
            return endcurrentArb(data.timestampFrom);
          }
          else {// no currenArbs in play
            // update in memory arbTrigger with new smarkets.b0 values
            arbTrigger.smarkets.b0 = {
              odds: data.odds,
              liquidity: data.liquidity
            };
            console.log('updated arbTrigger due to no arbs n no inplay currentArb via smarkets b0...');
            return console.log(arbTrigger);
          }
        }
      }
    }
    else if(data.betType == 'l0') {// check if l0
      if(!arbTrigger.betfair.b0.odds) {// check if oppossing cell not initialized
        arbTrigger.smarkets.l0 = {
          odds: data.odds,
          liquidity: data.liquidity
        };
        console.log('smarkets l0 seen - no betfair b0');
        return console.log(arbTrigger);
      }
      else {// check if arbs candidate exists
        const
          L0O = data.odds,
          L0L = data.liquidity,
          B0O = arbTrigger.betfair.b0.odds,
          B0L = arbTrigger.betfair.b0.liquidity;
        if((B0O > L0O) && ((B0O / L0O) > 1.02)) {// candidate exists
          console.log('candidate arb seen triggered by smarkets l0...');
          // create shallow copy of both betfairDeltas and smarketsDeltas
          let
            B = Object.assign({}, betfairDeltas),
            S = Object.assign({}, smarketsDeltas);
          console.log('created shallow copies of betfairDeltas and smarketsDeltas...');
          // update the B.b0 to new values
          B.b0 = {
            odds: B0O,
            liquidity: B0L
          };
          // update the S.l0 to new values
          S.l0 = {
            odds: L0O,
            liquidity: L0L
          };
          console.log('B:..');
          console.log(B);
          console.log('S:..');
          console.log(S);
          // derive target liquidity and win amount
          let targetLiquidity;
          if(B0L > L0L) {
            targetLiquidity = L0L;
          }
          else {
            targetLiquidity = B0L;
          }
          let WINAMT = (targetLiquidity * B0O * 0.98) - (targetLiquidity * L0O);
          let LOSEAMT = ((targetLiquidity * 0.98) - (targetLiquidity)) * (-1);
          WINAMT = accounting.formatMoney(Number(WINAMT.toFixed(2)), "£ ");
          LOSEAMT = accounting.formatMoney(Number(LOSEAMT.toFixed(2)), "£ ");

          // create arbsDoc object
          const arbsDoc = {
            selection: SELECTION,
            timestampFrom: data.timestamp,
            summary: `Bet ${SELECTION} on Betfair for £${targetLiquidity} at ${B0O}, Lay on Smarkets for £${targetLiquidity} at ${L0O}. Win Amount: ${WINAMT}. Lose Amount: ${LOSEAMT}`,
            b: B,
            s: S
          };
          // update in memory arbTrigger with new smarkets.l0 values
          arbTrigger.smarkets.l0 = {
            odds: L0O,
            liquidity: L0L
          };
          console.log('smarkets l0.. arbTrigger');
          console.log(arbTrigger);
          console.log('arbsDoc...');
          console.log(arbsDoc);
          // save the arbDoc
          return saveArbs(arbsDoc);
        }
        else {// candidate does NOT exist
          if(!!currentArb && !currentArb.timestampTo) {// check if any arbs in play
            console.log('terminating inplay currentArb due to smarkets l0...');
            console.log(currentArb);
            // update in memory arbTrigger with new smarkets.l0 values
            arbTrigger.smarkets.l0 = {
              odds: data.odds,
              liquidity: data.liquidity
            };
            console.log('updated arbTrigger due to no arbs but inplay currentArb via smarkets l0...');
            console.log(arbTrigger);
            // end in-play arbs
            return endcurrentArb(data.timestampFrom);
          }
          else {// no currentArbs in play
            // update in memory arbTrigger with new smarkets.l0 values
            arbTrigger.smarkets.l0 = {
              odds: data.odds,
              liquidity: data.liquidity
            };
            console.log('updated arbTrigger due to no arbs n no inplay currentArb via smarkets l0...');
            return console.log(arbTrigger);
          }
        }
      }
    }
  }
}

async function saveArbs(data) {
  if(!currentArb) {// check if first time arbs detected
    console.log('no currentArb... setting it to received data..');
    currentArb = data;
    console.log('currentArb...');
    console.log(currentArb);
    console.log('now saving new arbDoc...');
    return saveData(data);
  }
  else {// set timestampTo of existing arbsDoc to timestampFrom of new arbs doc
    console.log('currentArb exists...');
    // setup
    let
      start = new Date(currentArb.timestampFrom),
      end = new Date(data.timestampFrom);
    start = start.valueOf();
    end = end.valueOf();
    const duration = (end - start) / 1000;
    let endTime = new Date(data.timestampFrom);
    endTime = endTime.toISOString();
    const newSummary = currentArb.summary + `. Duration: ${duration} seconds.`;
    // update timestampTo of currenArbs
    const query = SelectionArbsDocModel.findOneAndUpdate({eventLabel: EVENT_LABEL, selection: SELECTION, 'arbs._timestampFrom': currentArb._timestampFrom}, { $set: {
      'arbs.$.timestampTo': endTime,
      'arbs.$.summary': newSummary
    }}, {new: true});
    try {
      const updatedOldArbsDocData = await query.exec();
      console.log('updatedOldArbsDocData...');
      console.log(updatedOldArbsDocData);
      const summary = updatedOldArbsDocData.summary;
      console.log(`summary to email: ${summary}`);
      request
        .post(ENDPOINT)
        .set('Accept', 'application/json')
        .send({
          "transport": "ses",
          "from": "noreply@valueservices.uk",
          "to": EMAIL,
          "subject": EVENT_LABEL,
          "emailbody": summary,
          "templateName": "GenericEmail"
        })
        .then(resp => {
          console.log('msg sending response...');
          return console.log(resp.statusCode);
        });
    }
    catch(err) {
      console.error('failed to update timestampTo field of existing arbsDoc...');
      const newErr = new Error(`failed to update timestampTo field of existing arbsDoc for ${SELECTION}`);
      return Promise.reject(newErr);
    }
    finally {
      return saveData(data);
    }
  }
  async function saveData(data) {
    // push data obj into 'arbs' array
    const query = SelectionArbsDocModel.findOneAndUpdate({eventLabel: EVENT_LABEL, selection: SELECTION}, {$push: {
        arbs: data
      }});
    try{
      const addedNewArbsDocData = await query.exec();
      console.log('addedNewArbsDocData...');
      console.log(addedNewArbsDocData);
      request
        .post(ENDPOINT)
        .set('Accept', 'application/json')
        .send({
          "transport": "ses",
          "from": "noreply@valueservices.uk",
          "to": EMAIL,
          "subject": EVENT_LABEL,
          "emailbody": data.summary,
          "templateName": "GenericEmail"
        })
        .then(resp => {
          console.log('msg sending response...');
          return console.log(resp.statusCode);
        });
      return Promise.resolve(true);
    }
    catch(err) {
      console.error('failed to add new data to selectonArbsDoc...');
      console.error(err);
      const newErr = new Error(`failed to add new data to selectonArbsDoc for ${SELECTION}`);
      return Promise.reject(newErr);
    }
  }
}

async function endcurrentArb(timestamp) {
  // setup
  let
    start = new Date(currentArb.timestampFrom),
    end = new Date(timestamp);
  start = start.valueOf();
  end = end.valueOf();
  const duration = (end - start) / 1000;
  let endTime = new Date(timestamp);
  endTime = endTime.toISOString();
  const newSummary = currentArb.summary + `. Duration: ${duration} seconds.`;
  // update timestampTo of in-play currenArbs
  const query = SelectionArbsDocModel.findOneAndUpdate({eventLabel: EVENT_LABEL, selection: SELECTION, 'arbs._timestampFrom': currentArb._timestampFrom}, { $set: {
    'arbs.$.timestampTo': endTime,
    'arbs.$.summary': newSummary
  }}, {new: true});
  try {
    const updatedOldArbsDocData = await query.exec();
    console.log('updatedOldArbsDocData...');
    console.log(updatedOldArbsDocData);
    const summary = updatedOldArbsDocData.summary;
    console.log(`summary to email: ${summary}`);
    request
      .post(ENDPOINT)
      .set('Accept', 'application/json')
      .send({
        "transport": "ses",
        "from": "noreply@valueservices.uk",
        "to": EMAIL,
        "subject": EVENT_LABEL,
        "emailbody": summary,
        "templateName": "GenericEmail"
      })
      .then(resp => {
        console.log('msg sending response...');
        return console.log(resp.statusCode);
      });
  }
  catch(err) {
    console.error('failed to update timestampTo field of existing arbsDoc...');
    const newErr = new Error(`failed to update timestampTo field of existing arbsDoc for ${SELECTION}`);
    return Promise.reject(newErr);
  }
  finally {// no arbs in play
    currentArb = null;
    console.log('currentArb set to null...');
    return console.log(currentArb);
  }
}

// execute
connectToDB()
  .then(ok => createSelectionDeltaDoc())
  .then(ok => createSelectionArbsDoc())
  //.then(ok => console.log(`all good from ${SELECTION}`))
  .catch(err => console.error(err));
