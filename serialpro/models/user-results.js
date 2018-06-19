'use strict';
//=============================================================================
const mongoose = require('mongoose');
//=============================================================================
// Schema
const UserResultSchema = mongoose.Schema({
  botName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  UTRNumber: {
    type: String,
    required: true
  },
  searchDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  failedBrandsList: [{
    brand: {type: String},
    img: {type: String}
  }],
  resultsBrandsList: [{
    brand: {type: String},
    img: {type: String},
    site: {type: String},
    quotePrice: {type: String},
    totalExcess: {type: String},
    includedFeatures: [String],
    excludedFeatures: [String]
  }],
  currentQueryRef: {
    type: Number
  },
  previousQueryRef: {
    type: Number
  }
});
// create index on 'eventLabel'
UserResultSchema.index({email: 1});
// compile to Model
const UserResultModel = mongoose.model('UserResult', UserResultSchema);
// export model
module.exports = UserResultModel;
