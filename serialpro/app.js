'use strict';

const util = require('util');
const execFile = util.promisify(require('child_process').execFile);


async function run() {
  let arr = [1, 2, 3, 4, 5];

  for(const el of arr) {
    console.log(el);
    const { stdout } = await execFile('node', ['./coordinator.js'], {maxBuffer: 400 * 1024 * 1024});
    console.log(stdout);
  }
}

run();
