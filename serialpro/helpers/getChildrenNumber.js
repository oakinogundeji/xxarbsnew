function getChildrenNumber(CHILDREN_NUMBER, CHILDREN_NUMBER_OPTIONS) {
  let CHILDREN_NUMBER_RESPONSE;

  if (CHILDREN_NUMBER >= 10) {
    const totalOptions = CHILDREN_NUMBER_OPTIONS.length;
    CHILDREN_NUMBER_RESPONSE = CHILDREN_NUMBER_OPTIONS[totalOptions - 1].value;
    return CHILDREN_NUMBER_RESPONSE;
  }

  for (let i = 0; i < CHILDREN_NUMBER_OPTIONS.length; i++) {
    const CHILDREN_NUMBER_OPTION = CHILDREN_NUMBER_OPTIONS[i];
    if (CHILDREN_NUMBER === CHILDREN_NUMBER_OPTION.label) {
      CHILDREN_NUMBER_RESPONSE = CHILDREN_NUMBER_OPTION.value;
      break;
    }
  }

  return CHILDREN_NUMBER_RESPONSE;
}

module.exports = getChildrenNumber;