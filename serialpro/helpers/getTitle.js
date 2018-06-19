function getTitle(TITLE, GENDER) {
  let TITLE_RESPONSE;
  if(TITLE == 'Mr') {
    TITLE_RESPONSE = '1';
  }
  else if(TITLE == 'Mrs') {
    TITLE_RESPONSE = '2';
  }
  else if(TITLE == 'Miss') {
    TITLE_RESPONSE = '3';
  }
  else if(TITLE == 'Ms') {
    TITLE_RESPONSE = '4';
  }
  else if((TITLE == 'Dr') && (GENDER == 'Male')) {
    TITLE_RESPONSE = '5';
  }
  else if((TITLE == 'Dr') && (GENDER != 'Male')) {
    TITLE_RESPONSE = '6';
  }
  return TITLE_RESPONSE;
}

module.exports = getTitle;