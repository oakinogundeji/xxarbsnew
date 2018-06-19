function getDrivingLicenseType(DRIVING_LICENSE_TYPE, DRIVING_LICENSE_TYPE_OPTIONS, WHERE_ISSUED) {
  let DRIVING_LICENSE_TYPE_RESPONSE;
  DRIVING_LICENSE_TYPE = DRIVING_LICENSE_TYPE.toLowerCase();
  if (DRIVING_LICENSE_TYPE.includes('full')) {
    if (WHERE_ISSUED == 'UK') {
      DRIVING_LICENSE_TYPE_RESPONSE = DRIVING_LICENSE_TYPE_OPTIONS[0].value;
    } else {
      DRIVING_LICENSE_TYPE_RESPONSE = DRIVING_LICENSE_TYPE_OPTIONS[3].value;
    }
  } else if (DRIVING_LICENSE_TYPE.includes('provisional')) {
    DRIVING_LICENSE_TYPE_RESPONSE = DRIVING_LICENSE_TYPE_OPTIONS[1].value;
  } else if (DRIVING_LICENSE_TYPE.includes('auto')) {
    DRIVING_LICENSE_TYPE_RESPONSE = DRIVING_LICENSE_TYPE_OPTIONS[2].value;
  } else {
    DRIVING_LICENSE_TYPE_RESPONSE = DRIVING_LICENSE_TYPE_OPTIONS[4].value;
  }

  return DRIVING_LICENSE_TYPE_RESPONSE;
}

module.exports = getDrivingLicenseType;