'use strict';
//=============================================================================
const mongoose = require('mongoose');
//=============================================================================
// Schema
const SelectionArbsDocSchema = mongoose.Schema({
  eventLabel: {
    type: String,
    required: true
  },
  eventDate: {
    type: String,
    required: true
  },
  selection: {
    type: String,
    required: true
  },
  arbs: [
    {
      B0O: {
        type: Number
      },
      L0O: {
        type: Number
      },
      targetLiquidity: {
        type: Number
      },
      selection: {
        type: String,
        required: true
      },
      timestampFrom: {
        type:String,
        required: true
      },
      timestampTo: {
        type: String,
        default: ''
      },
      b: {
        b0: {
          odds: {
            type: Number
          },
          liquidity: {
            type: Number
          }
        },
        l0: {
          odds: {
            type: Number
          },
          liquidity: {
            type: Number
          }
        },
        b1: {
          odds: {
            type: Number
          },
          liquidity: {
            type: Number
          }
        },
        l1: {
          odds: {
            type: Number
          },
          liquidity: {
            type: Number
          }
        },
        b2: {
          odds: {
            type: Number
          },
          liquidity: {
            type: Number
          }
        },
        l2: {
          odds: {
            type: Number
          },
          liquidity: {
            type: Number
          }
        },
        matchedAmount: {
          type: Number
        }
      },
      s: {
        b0: {
          odds: {
            type: Number
          },
          liquidity: {
            type: Number
          }
        },
        l0: {
          odds: {
            type: Number
          },
          liquidity: {
            type: Number
          }
        },
        b1: {
          odds: {
            type: Number
          },
          liquidity: {
            type: Number
          }
        },
        l1: {
          odds: {
            type: Number
          },
          liquidity: {
            type: Number
          }
        },
        b2: {
          odds: {
            type: Number
          },
          liquidity: {
            type: Number
          }
        },
        l2: {
          odds: {
            type: Number
          },
          liquidity: {
            type: Number
          }
        },
        matchedAmount: {
          type: Number
        }
      },
      summary: {
        type: String
      }
    }
  ]
});
// create index on 'eventLabel'
SelectionArbsDocSchema.index({eventLabel: 1, selection: 1});
// compile to Model
const SelectionArbsDocModel = mongoose.model('SelectionArbsDoc', SelectionArbsDocSchema);
// export model
module.exports = SelectionArbsDocModel;
