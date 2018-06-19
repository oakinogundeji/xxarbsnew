function getVehicleUsage(VEHICLE_USAGE, VEHICLE_USAGE_OPTIONS) {
  let VEHICLE_USAGE_RESPONSE;
  VEHICLE_USAGE = VEHICLE_USAGE.toLowerCase();
  if (VEHICLE_USAGE.includes('social')) {
    // Social : as common keyword /commuting as `option` value identifier
    if (!VEHICLE_USAGE.includes('commuting')) {
      VEHICLE_USAGE_RESPONSE = VEHICLE_USAGE_OPTIONS[0].value;
    } else {
      VEHICLE_USAGE_RESPONSE = VEHICLE_USAGE_OPTIONS[1].value;
    }
  } else if (VEHICLE_USAGE.includes('business')) {
    // Business : as common keyword /spouse/parter as `option` value identifiers
    if (VEHICLE_USAGE.includes('me' && 'spouse' && 'partner')) {
      VEHICLE_USAGE_RESPONSE = VEHICLE_USAGE_OPTIONS[3].value;
    } else if (VEHICLE_USAGE.includes('spouse' && 'partner') && !VEHICLE_USAGE.includes('me')) {
      VEHICLE_USAGE_RESPONSE = VEHICLE_USAGE_OPTIONS[4].value;
    } else if (VEHICLE_USAGE.includes('all')) {
      VEHICLE_USAGE_RESPONSE = VEHICLE_USAGE_OPTIONS[5].value;
    } else {
      VEHICLE_USAGE_RESPONSE = VEHICLE_USAGE_OPTIONS[2].value;
    }
  } else {
    VEHICLE_USAGE_RESPONSE = VEHICLE_USAGE_OPTIONS[6].value;
  }

  return VEHICLE_USAGE_RESPONSE;
}

module.exports = getVehicleUsage;