function getCoverType(COVER_TYPE, COVER_TYPE_OPTIONS) {
  let COVER_TYPE_RESPONSE;
  COVER_TYPE = COVER_TYPE.toLowerCase();
  if (COVER_TYPE.includes('comprehensive')) {
    COVER_TYPE_RESPONSE = COVER_TYPE_OPTIONS[0].value;
  } else if (COVER_TYPE.includes('fire' || 'theft')) {
    COVER_TYPE_RESPONSE = COVER_TYPE_OPTIONS[1].value;
  } else {
    COVER_TYPE_RESPONSE = COVER_TYPE_OPTIONS[2].value;
  }

  return COVER_TYPE_RESPONSE;
}

module.exports = getCoverType;