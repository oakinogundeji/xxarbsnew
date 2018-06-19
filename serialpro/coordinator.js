/**
 * created by Muyi on 26-04-2018
 */
 //============================================================================
 'use strict';
 if(process.env.NODE_ENV != 'production') {
   require('dotenv').config();
 }
//=============================================================================
// dependencies
const
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  DBURL = process.env.DBURL,
  {spawn} = require('child_process'),
  {promisify} = require('util'),
  fs = require('fs'),
  readFileAsync = promisify(fs.readFile),
  UserResultsModel = require('./models/user-results');
// variables
let
  JSON_DATA,
  UTRN;
// helper functions
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
    console.log('GoCompare Coordinator dBase connection closed due to app termination');
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
       console.info(`GoCompare Coordinator successfully connected to ${DBURL}`);
       return resolve(true);
     });
     db.once('disconnected', () => {
       console.info('GoCompare Coordinator successfully disconnected from ' + DBURL);
     });
   });
 }

async function getJSONSample() {
  const gotData = await readFileAsync('./data.json', 'utf8');
  if(gotData) {
    return Promise.resolve(gotData);
  }
  else {
    return Promise.reject(false);
  }
}

function generateUniqueTransactionRef() {
  let
    date = new Date().getTime(),
    xterBank = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    fstring = '',
    i;
  for(i = 0; i < 17; i++) {
    fstring += xterBank[parseInt(Math.random() * 52)];
  }
  return (fstring += date);
}

async function createNewUser(data) {
  console.log('user is new...');
  const EMAIL = data.quoteObject.subject.email['-address'];
  UTRN = generateUniqueTransactionRef();
  let userData = {
    botName: 'gocompare',
    email: EMAIL,
    failedBrandsList: [],
    resultsBrandsList: [],
    UTRNumber: UTRN
  };
  const newUserResultsDoc = new UserResultsModel(userData);
  const saveNewUserResultsDoc = await newUserResultsDoc.save();
  if((saveNewUserResultsDoc.email == userData.email) && (saveNewUserResultsDoc.UTRNumber == userData.UTRNumber)) {
    console.log(`successfully created userResultsDoc for ${saveNewUserResultsDoc.email}`);
    console.log(saveNewUserResultsDoc);
    const OUTPUT = JSON.stringify(data);
    return Promise.resolve(OUTPUT);
  } else {
    console.error(`failed to create userResultsDoc for ${saveNewUserResultsDoc.email}`);
    const newErr = new Error(`failed to create userResultsDoc for ${saveNewUserResultsDoc.email}`);
    return Promise.reject(newErr);
  }
}

function spawnFillDataBot(JSON_DATA) {
  const FILL_DATA_BOT = spawn('node', ['./fill-data.js', JSON_DATA], {
    stdio: ['pipe', 'ipc', 'pipe']
  });

  FILL_DATA_BOT.on('message', msg => {
    try {
      const data = JSON.parse(msg);
      if(data.type == 'failed-brand') {
        delete data.type;
        return saveFailedBrandData(data);
      }
      else if(data.type == 'result-brand') {
        delete data.type;
        return saveResultsBrandData(data);
      }
      else {
        return console.log(data);
      }
    }
    catch(err) {
      console.log(err);
    }
  });

  FILL_DATA_BOT.stderr.on('data', err => {
    console.error(`FILL_DATA_BOT BOT err`);
    console.error(err.toString());
    console.log(`terminating existing Filldatabot BOT`);
    return process.kill(FILL_DATA_BOT.pid);
  });

  FILL_DATA_BOT.on('error', err => {
    console.error(`FILL_DATA_BOT CP err`);
    console.error(err);
    console.log(`terminating existing Filldatabot BOT`);
    return process.kill(FILL_DATA_BOT.pid);
  });

  FILL_DATA_BOT.on('close', code => {
    if (code < 1) {
      console.log(`FILL_DATA_BOT BOT closed normally`);
      process.exit(0);
    } else {
      console.error(`FILL_DATA_BOT BOT closed abnormally`);
      process.exit(0);
    }
  });
}

async function saveFailedBrandData(data) {
  const EMAIL = JSON_DATA.quoteObject.subject.email['-address'];
  // check if user exists already
  const query = UserResultsModel.findOne({botName: 'gocompare', email: EMAIL, UTRNumber: UTRN});
  const foundDoc = await query.exec();
  if(!!foundDoc && ((foundDoc.botName == 'gocompare') && (foundDoc.email == EMAIL) && (foundDoc.UTRNumber == UTRN))) {
    console.log('user already exists');
    const query = UserResultsModel.findOneAndUpdate({email: EMAIL, UTRNumber: UTRN}, {
      $push: {
        failedBrandsList: data
      }
    });
    try {
      const addedNewFailedBrandsListData = await query.exec();
      console.log('addedNewFailedBrandsListData...');
      console.log(addedNewFailedBrandsListData);
      return Promise.resolve(true);
    }
    catch(err) {
      console.error('failed to update new failedBrandsList data...');
      const newErr = new Error(`failed to update new failedBrandsList data... for ${EMAIL}`);
      return Promise.reject(newErr);
    }
  }
  else {
    console.log('user does NOT exist');
    const newErr = new Error(`user with email: ${EMAIL} does NOT exist`);
    return Promise.reject(newErr);
  }
}

async function saveResultsBrandData(data) {
  const EMAIL = JSON_DATA.quoteObject.subject.email['-address'];
  // check if user exists already
  const query = UserResultsModel.findOne({botName: 'gocompare', email: EMAIL, UTRNumber: UTRN});
  const foundDoc = await query.exec();
  if(!!foundDoc && ((foundDoc.botName == 'gocompare') && (foundDoc.email == EMAIL) && (foundDoc.UTRNumber == UTRN))) {
    const query = UserResultsModel.findOneAndUpdate({email: EMAIL, UTRNumber: UTRN}, {
      $push: {
        resultsBrandsList: data
      }
    });
    try {
      const addedNewResultsBrandsListData = await query.exec();
      console.log('addedNewResultsBrandsListData...');
      console.log(addedNewResultsBrandsListData);
      return Promise.resolve(true);
    }
    catch(err) {
      console.error('failed to update new resultsBrandsList data...');
      const newErr = new Error(`failed to update new resultsBrandsList data... for ${EMAIL}`);
      return Promise.reject(newErr);
    }
  }
  else {
    console.log('user does NOT exist');
    const newErr = new Error(`user with email: ${EMAIL} does NOT exist`);
    return Promise.reject(newErr);
  }
}

connectToDB()
  .then(ok => getJSONSample())
  .then(data => {
    JSON_DATA = JSON.parse(data);
    console.log('JSON_DATA...');
    console.log(JSON_DATA);
    return createNewUser(JSON_DATA);
  })
  .then(data => spawnFillDataBot(data))
  .catch(err => console.error(err));
