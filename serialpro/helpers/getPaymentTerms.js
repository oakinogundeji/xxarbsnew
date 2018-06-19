function getPaymentTerms(PAYMENT_TERMS, PAYMENT_TERMS_OPTIONS) {
  let PAYMENT_TERMS_RESPONSE;
  PAYMENT_TERMS = PAYMENT_TERMS.toLowerCase();
  if (PAYMENT_TERMS.includes('annual' || 'year')) {
    PAYMENT_TERMS_RESPONSE = PAYMENT_TERMS_OPTIONS[0].value;
  } else if (PAYMENT_TERMS.includes('month')) {
    PAYMENT_TERMS_RESPONSE = PAYMENT_TERMS_OPTIONS[1].value;
  }

  return PAYMENT_TERMS_RESPONSE;
}

module.exports = getPaymentTerms;