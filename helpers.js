'use strict';

const logger = require('log4js');

logger.configure({
  appenders: {
    APP: {
      type: 'file',
      filename: 'app.log'
    }
  },
  categories: {
    default: {
      appenders: ['APP'],
      level: 'info'
    }
  }
});

module.exports = logger;
