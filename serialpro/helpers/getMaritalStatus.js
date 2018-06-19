function getMaritalStatus(MARITAL_STATUS) {
  let MARITAL_STATUS_RESPONSE;
  if(MARITAL_STATUS == 'S1') {//SINGLE
    MARITAL_STATUS_RESPONSE = '7';
  }
  else if(MARITAL_STATUS == 'M') {// MARRIED
    MARITAL_STATUS_RESPONSE = '8';
  }
  else if(MARITAL_STATUS == 'CL') {// COMMON LAW/ LIVING WITH PARTNER
    MARITAL_STATUS_RESPONSE = '2640';
  }
  else if(MARITAL_STATUS == 'CP') {// CIVIL PARTNER
    MARITAL_STATUS_RESPONSE = '9';
  }
  else if(MARITAL_STATUS =='D') {// DIVORCED
    MARITAL_STATUS_RESPONSE = '10';
  }
  else if(MARITAL_STATUS == 'S2') {// SEPARATED
    MARITAL_STATUS_RESPONSE = '11';
  }
  else if(MARITAL_STATUS == 'W') {// WIDOWED
    MARITAL_STATUS_RESPONSE = '12';
  }
  return MARITAL_STATUS_RESPONSE;
}

module.exports = getMaritalStatus;