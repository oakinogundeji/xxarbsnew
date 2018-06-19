'use strict';

const util = require('util');
const {spawn} = require('child_process');


function spawnCoordinator() {
  return new Promise((resolve, reject) => {
    const COORDINATOR = spawn('node', ['./coordinator.js',]);

    COORDINATOR.stdout.on('data', data => {
      console.log('data from COORDINATOR...');
      console.log(data.toString());
    });

    COORDINATOR.stderr.on('data', err => {
      console.log('err from COORDINATOR...');
      return resolve(err.toString());
    });

    COORDINATOR.on('close', code => {
      if(code < 1) {
        return resolve('COORDINATOR BOT closed normally...');
      } else {
        return resolve('COORDINATOR BOT closed abnormally...');
      }
    });
  });
}


async function run() {
  let arr = [1, 2, 3, 4, 5];

  for(const el of arr) {
    console.log(el);
    await spawnCoordinator();
    console.log('ready for next...');
  }
}
run();
