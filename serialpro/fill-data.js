/**
 * created by Muyi on 15-04-2018
 */
 //============================================================================
 'use strict';
//=============================================================================
// dependencies
const P = require('puppeteer');
const HELPERS = require('./helpers');
let JSON_DATA = process.argv[2];
JSON_DATA = JSON.parse(JSON_DATA);

// selectors
const
  URL = 'https://car.gocompare.com/vehicle',
  GET_QUOTES_SELECTOR_1 = 'body > section.hero-products > article.car.active > div > section > a.button.get-quote.car > span.label',
  REG_NUM_SELECTOR = '#AboutCarPanel_RegNumber',
  FIND_CAR_SELECTOR = '#about-car-panel > div.question.first.carLookup-question > div:nth-child(4) > a',
  VEHICLE_YES_SELECTOR = '#assumptions-card > div > ul > li:nth-child(1) > label > span',
  MODIFIED_NO_SELECTOR = '#has-modifications > ul > li:nth-child(2) > label > span',
  PURCHASE_MONTH_SELECTOR = '#OwningAndUsingCarPanel_DateOfPurchase_Month',
  PURCHASE_YEAR_SELECTOR = '#OwningAndUsingCarPanel_DateOfPurchase_Year',
  OWNER_YES_SELECTOR = '#form0 > fieldset.owning-and-using-car-panel > div.question.legal-owner > ul > li:nth-child(1) > label > span',
  KEEPER_YES_SELECTOR = '#form0 > fieldset.owning-and-using-car-panel > div.question.registered-keeper.question-next > ul > li:nth-child(1) > label > span',
  VEHICLE_USE_SELECTOR = '#OwningAndUsingCarPanel_UseOfVehicle',
  VEHICLE_OVERNIGHT_PARKING_SELECTOR = '#form0 > fieldset.owning-and-using-car-panel > div.question.popular-question > span.question-layout.radio-button-list.popular-answers',
  VEHICLE_OVERNIGHT_PARKING_OPTION_SELECTOR = `${VEHICLE_OVERNIGHT_PARKING_SELECTOR} > div:nth-child(INDEX) > label > span > span`,
  VEHICLE_MILEAGE_SELECTOR = '#OwningAndUsingCarPanel_TotalAnnualMileage',
  PEAK_TIME_YES_SELECTOR = '#form0 > fieldset.owning-and-using-car-panel > div:nth-child(12) > ul > li:nth-child(1) > label > span',
  PEAK_TIME_NO_SELECTOR = '#form0 > fieldset.owning-and-using-car-panel > div:nth-child(12) > ul > li:nth-child(2) > label > span',
  FORENAME_SELECTOR = '#ProposerDetails_FirstName',
  SURNAME_SELECTOR = '#ProposerDetails_Surname',
  BIRTH_DAY_SELECTOR = '#ProposerDetails_DateOfBirth_Day',
  BIRTH_MONTH_SELECTOR = '#ProposerDetails_DateOfBirth_Month',
  BIRTH_YEAR_SELECTOR = '#ProposerDetails_DateOfBirth_Year',
  EMAIL_SELECTOR = '#ProposerDetails_EmailAddress',
  /*NO_UPDATES_SELECTOR = '#form0 > div.customer-preference-question > div.customer-preference-question-bottom > div.customer-preference-question-buttons > ul > li:nth-child(2) > label > span',*/
  NO_UPDATES_SELECTOR = '#form0 > div:nth-child(6) > div > div.customer-preference-question-bottom > div.customer-preference-question-buttons > ul > li:nth-child(2) > label > span',
  REMEMBER_ME_1_SELECTOR = '#form0 > div.navigationcontainer > div.rememberMe.checkbox.small.checked > label',
  CONTINUE_1_SELECTOR = '#continue-button',
  TITLE_SELECTOR = '#AboutYouPanelViewModel_ProposerTitle',
  MARITAL_STATUS_SELECTOR = '#AboutYouPanelViewModel_MaritalStatus',
  RESIDENT_SINCE_MONTH_SELECTOR = '#AboutYouPanelViewModel_HowLongInUK_Month',
  RESIDENT_SINCE_YEAR_SELECTOR = '#AboutYouPanelViewModel_HowLongInUK_Year',
  PHONE_NUMBER_SELECTOR = '#AboutYouPanelViewModel_MainTelephoneNumber',
  HOME_OWNER_YES_SELECTOR = '#form0 > fieldset:nth-child(2) > div:nth-child(7) > ul > li:nth-child(1) > label > span',
  HOME_OWNER_NO_SELECTOR = '#form0 > fieldset:nth-child(2) > div:nth-child(7) > ul > li:nth-child(2) > label > span',
  CHILDREN_NUMBER_SELECTOR = '#form0 > fieldset:nth-child(2) > div:nth-child(8) > span.question-layout.number-picker > ul',
  HEAR_ABOUT_US_SELECTOR = '#AboutYouPanelViewModel_WhereDidYouHearAboutUs',
  POSTCODE_SELECTOR = '#YourAddressDetailsViewModel_Address_Postcode',
  FIND_ADDRESS_SELECTOR = '#ProposerAddress > div.address-select > div:nth-child(2) > a',
  ADDRESS_LIST_SELECTOR = '#form0 > fieldset.address-details-panel > div.address-list-panel.question-extended > fieldset > div > ul',
  KEPT_OVERNIGHT_HERE_SELECTOR = '#form0 > fieldset.address-details-panel > div.question.overnight-address > ul > li:nth-child(1) > label > span',
  CAR_NUMBER_SELECTOR = '#form0 > fieldset.address-details-panel > div:nth-child(7) > span.question-layout.number-picker > ul',
  EMPLOYMENT_STATUS_SELECTOR = '#form0 > fieldset:nth-child(4) > div.full-time-employment-question > div.question.first > span.question-layout.radio-button-list.popular-employment-status',
  EMPLOYMENT_STATUS_OPTION_SELECTOR = `${EMPLOYMENT_STATUS_SELECTOR} > div:nth-child(INDEX) > label > span > span`,
  FULLTIME_OCCUPATION_INPUT_SELECTOR = '#YourOccupationPanel_FullTimeOccupationGroup_FullTimeOccupation_Occupation',
  FULLTIME_OCCUPATION_LIST_SELECTOR = '#form0 > fieldset:nth-child(4) > div.full-time-employment-question > div.popout.employment-details.hide-by-default > div.question.first.popout-question.occupation-search.hide-by-default > span:nth-child(4) > div > ul.occupation-list.multi-select-list.hide-by-default',
  TYPE_OF_BUSINESS_INPUT_SELECTOR = '#YourOccupationPanel_FullTimeOccupationGroup_FullTimeOccupation_Business',
  TYPE_OF_BUSINESS_LIST_SELECTOR = '#form0 > fieldset:nth-child(4) > div.full-time-employment-question > div.popout.employment-details.hide-by-default > div.question.first.popout-question.occupation-search.hide-by-default > span:nth-child(4) > div > ul.business-list.multi-select-list.hide-by-default',
  NO_PART_TIME_EMPLOYMENT_SELECTOR = '#form0 > fieldset:nth-child(4) > div.part-time-employment-question > div.question > ul > li:nth-child(2) > label > span',
  CONTINUE_2_SELECTOR = '#continue-button',
  DRIVING_LICENSE_TYPE_SELECTOR = '#form0 > fieldset.about-your-driving-view-model-panel > div.question.first.popular-question > span.question-layout.radio-button-list.popular-answers.licence-type-popular-answers',
  DRIVING_LICENSE_TYPE_OPTION_SELECTOR = `${DRIVING_LICENSE_TYPE_SELECTOR} > div:nth-child(INDEX) > label > span > span`,
  DRIVING_LICENSE_DURATION_SELECTOR = '#AboutYourDrivingPanelViewModel_LicenceLengthViewModel_LicenceLengthYears',
  DLVA_YES_SELECTOR = '#form0 > fieldset.about-your-driving-view-model-panel > div.question.medical-conditions > ul > li:nth-child(1) > label > span',
  DLVA_NO_SELECTOR = '#form0 > fieldset.about-your-driving-view-model-panel > div.question.medical-conditions > ul > li:nth-child(2) > label > span',
  DRIVING_LICENSE_NO_CLAIMS_SELECTOR = '#AboutYourDrivingPanelViewModel_NoClaimsBonus',
  NO_IAM_CERT_SELECTOR = '#form0 > fieldset.about-your-driving-view-model-panel > div.question.has-iam.hide-by-default > ul > li:nth-child(2) > label > span',
  YES_DRIVE_OTHER_CARS_SELECTOR = '#form0 > fieldset.about-your-driving-view-model-panel > div.question.has-other-vehicles.question-next > ul > li:nth-child(1) > label > span',
  NO_DRIVE_OTHER_CARS_SELECTOR = '#form0 > fieldset.about-your-driving-view-model-panel > div.question.has-other-vehicles.question-next > ul > li:nth-child(2) > label > span',
  LICENSE_DETAILS_NO_SELECTOR = '#form0 > fieldset.driving-licence-panel > div.question.driving-licence-gateway.first > ul > li:nth-child(2) > label > span',
  NO_CLAIMS_SELECTOR = '#claim-gateway-question > ul > li:nth-child(2) > label > span',
  NO_CONVICTIONS_SELECTOR = '#conviction-gateway-question > ul > li:nth-child(2) > label > span',
  NO_NONMOTORING_CONVICTIONS_SELECTOR = '#form0 > fieldset.claims-and-convictions-panel > div:nth-child(8) > ul > li:nth-child(2) > label > span',
  CONTINUE_3_SELECTOR = '#continue-button',
  COVER_START_PICKER_SELECTOR =  '#AboutYourCoverPanelViewModel_CoverStartDateViewModel_CoverStartDate',
  FULL_MONTH_SELECTOR = '#ui-datepicker-div > div.ui-datepicker-group.ui-datepicker-group-last > table',
  PART_MONTH_SELECTOR = '#ui-datepicker-div > div.ui-datepicker-group.ui-datepicker-group-first',
  NO_RENEWAL_REMINDER_SELECTOR = '#form0 > fieldset:nth-child(2) > div.renewalCustomerPreferences.hidden.visible > div > div.renewal-question-bottom > div.renewal-question-buttons > ul > li:nth-child(2) > label > span',
  COVER_TYPE_SELECTOR = '#form0 > fieldset:nth-child(2) > div.question.popular-question.cover-type-question > span.question-layout.radio-button-list.popular-answers',
  COVER_TYPE_OPTION_SELECTOR = `${COVER_TYPE_SELECTOR} > div:nth-child(INDEX) > label > span > span`,
  VOLUNTARY_EXCESS_SELECTOR = '#form0 > fieldset:nth-child(2) > div.question.popular-question.voluntary-excess-answers > span.question-layout.radio-button-list.popular-answers',
  VOLUNTARY_EXCESS_OPTION_SELECTOR = `${VOLUNTARY_EXCESS_SELECTOR} > div:nth-child(INDEX) > label > span > span`,
  NO_INSURANCE_DENIED_SELECTOR = '#form0 > fieldset:nth-child(2) > div:nth-child(6) > ul > li:nth-child(2) > label > span',
  RENEWAL_PRICE_SELECTOR = '#AboutYourCoverPanelViewModel_RenewalPrice',
  PAY_SELECTOR = '#form0 > fieldset:nth-child(2) > div:nth-child(8) > span.question-layout.radio-button-list',
  PAY_OPTION_SELECTOR = `${PAY_SELECTOR} > div:nth-child(INDEX) > label > span > span`,
  NO_CONTACT_ME_SELECTOR = '#form0 > fieldset:nth-child(3) > div > ul > li:nth-child(2) > label > span',
  NO_BREAKDOWN_COVER_SELECTOR = '#form0 > fieldset:nth-child(5) > div.question.first.cross-sell-question > div:nth-child(4) > span:nth-child(2) > ul > li:nth-child(2) > label > span',
  NO_HOME_INSURANCE_SELECTOR = '#CrossSellPanelViewModel_CrossSellHomeInsuranceViewModel_RenewalMonthToStore',
  CREATE_PWD_SELECTOR = '#SecurityDetailsViewModel_Password',
  RETYPE_PWD_SELECTOR = '#SecurityDetailsViewModel_PasswordConfirmation',
  PWD_CLUE_SELECTOR = '#SecurityDetailsViewModel_PasswordClue',
  MAIDEN_NAME_SELECTOR = '#SecurityDetailsViewModel_MothersMaidenName',
  KEEP_SIGNED_IN_SELECTOR = '#RememberMe',
  GET_QUOTES_SELECTOR_2 = '#form0 > fieldset:nth-child(8) > div > span > a.continue-button.has-loading-placeholder';

// helpers
function generateDummyName() {
  let
  xterBank = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  fstring = '',
  i;
  for(i = 0; i < 7; i++) {
    fstring += xterBank[parseInt(Math.random() * 52)];
  }
  return fstring;
}

// bot
async function bot() {
  // instantiate browser
  const browser = await P.launch({
    headless: false,
    timeout: 180000
  });
  // create blank page
  const page = await browser.newPage();
  // set viewport to 1366*768
  await page.setViewport({width: 1366, height: 768});
  // set the user agent
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)');
  // allow 'page' instance to output any calls to browser log to process obj
  page.on('console', data => {
    try {
      const msg = JSON.parse(data.text());
      if((typeof(msg.type) == 'string') && ((msg.type == 'failed-brand') || (msg.type == 'result-brand'))) {
        return process.send(data.text());
      }
      else {
        return null;
      }
    }
    catch(err) {
      return null;
    }
  });
  // navigate to EVENT_URL
  await page.goto(URL, {
    waitUntil: 'networkidle2',
    timeout: 180000
  });
  // click on GET_QUOTES_SELECTOR_1
  await page.waitForSelector(GET_QUOTES_SELECTOR_1, {timeout: 181000});
  await page.click(GET_QUOTES_SELECTOR_1);
  // PAGE 1
  // insert car VRN
  await page.waitFor(2*1000);
  await page.waitForSelector(REG_NUM_SELECTOR, {timeout: 181000});
  const VRN = JSON_DATA.quoteObject.vehicle['-vrn'];
  await page.type(REG_NUM_SELECTOR, VRN, {delay: 100});
  // find car
  await page.waitFor(2*1000);
  await page.waitForSelector(FIND_CAR_SELECTOR, {timeout: 181000});
  await page.click(FIND_CAR_SELECTOR);
  // confirm car details
  await page.waitFor(2*1000);
  await page.waitForSelector(VEHICLE_YES_SELECTOR, {timeout: 181000});
  await page.click(VEHICLE_YES_SELECTOR);
  // reject car mods
  await page.waitFor(2*1000);
  await page.waitForSelector(MODIFIED_NO_SELECTOR, {timeout: 181000});
  await page.click(MODIFIED_NO_SELECTOR);
  await page.waitFor(2*1000);
  await page.waitForSelector('#AboutCarPanel_EstimatedMarketValue', {timeout: 181000});
  const isFilled = await page.$eval('#AboutCarPanel_EstimatedMarketValue', target => target.value);
  if(!isFilled) {
    await page.type('#AboutCarPanel_EstimatedMarketValue', '1234', {delay: 100});
  }

  // insert purchase month/year
  const VEHICLE_PURCHASE_DATE = JSON_DATA.quoteObject.vehicle['-purchase_date'];
  const VEHICLE_PURCHASE_DATE_ARR = VEHICLE_PURCHASE_DATE.split('-');
  await page.waitFor(2*1000);
  await page.waitForSelector(PURCHASE_MONTH_SELECTOR, {timeout: 181000});
  await page.type(PURCHASE_MONTH_SELECTOR, VEHICLE_PURCHASE_DATE_ARR[1], {delay: 100});
  await page.waitFor(2*1000);
  await page.waitForSelector(PURCHASE_YEAR_SELECTOR, {timeout: 181000});
  await page.type(PURCHASE_YEAR_SELECTOR, VEHICLE_PURCHASE_DATE_ARR[0], {delay: 100});
  // confirm legal ownership
  await page.waitFor(2*1000);
  await page.waitForSelector(OWNER_YES_SELECTOR, {timeout: 181000});
  await page.click(OWNER_YES_SELECTOR);
  // confirm registered keeper
  await page.waitFor(2*1000);
  await page.waitForSelector(KEEPER_YES_SELECTOR, {timeout: 181000});
  await page.click(KEEPER_YES_SELECTOR);
  // select vehicle usage
  const VEHICLE_USAGE = JSON_DATA.quoteObject.vehicle['-use'];
  const VEHICLE_USAGE_OPTIONS = await page.$eval(VEHICLE_USE_SELECTOR, target => {
    let res = [];
    const OPTIONS = target.children
    for (let i = 1; i < OPTIONS.length; i++) {
      const option = OPTIONS[i];
      res.push({
        label: option.innerHTML,
        value: option.getAttribute('value')
      })
    }

    return res;
  });
  const VEHICLE_USAGE_RESPONSE = HELPERS.getVehicleUsage(VEHICLE_USAGE, VEHICLE_USAGE_OPTIONS);
  // console.log(`${VEHICLE_USAGE_RESPONSE}`);
  await page.waitFor(2*1000);
  await page.waitForSelector(VEHICLE_USE_SELECTOR, {timeout: 181000});
  await page.click(VEHICLE_USE_SELECTOR);
  await page.select(VEHICLE_USE_SELECTOR, VEHICLE_USAGE_RESPONSE);
  // select over night storage
  const OVERNIGHT_STORAGE = JSON_DATA.quoteObject.vehicle['-kept_overnight'].toLowerCase();
  const OVERNIGHT_STORAGE_OPTIONS = await page.$eval(VEHICLE_OVERNIGHT_PARKING_SELECTOR,
    (target, VEHICLE_OVERNIGHT_PARKING_OPTION_SELECTOR) => {
      let res = [];
      const OPTIONS = target.children
      for (let i = 0; i < OPTIONS.length-1; i++) {
        const option = OPTIONS[i];
        const label = option.querySelector('label > span > span').innerHTML.toLowerCase();
        const value = VEHICLE_OVERNIGHT_PARKING_OPTION_SELECTOR.replace('INDEX', i+1);
        res.push({
          label,
          value
        });
      }

      return res;
    }, VEHICLE_OVERNIGHT_PARKING_OPTION_SELECTOR);
  const OVERNIGHT_STORAGE_RESPONSE = HELPERS.getOvernightStorage(OVERNIGHT_STORAGE, OVERNIGHT_STORAGE_OPTIONS);
  // console.log(`${OVERNIGHT_STORAGE_RESPONSE}`);
  await page.waitFor(2*1000);
  await page.waitForSelector(OVERNIGHT_STORAGE_RESPONSE, {timeout: 181000});
  await page.click(OVERNIGHT_STORAGE_RESPONSE);
  // set annual mileage
  const ANNUAL_MILEAGE = Number(JSON_DATA.quoteObject.vehicle['-mileage']);
  //console.log(`${ANNUAL_MILEAGE}`);
  const ANNUAL_MILEAGE_RESPONSE = HELPERS.getAnnualMileage(ANNUAL_MILEAGE);
  //console.log(`${ANNUAL_MILEAGE_RESPONSE}`);
  await page.waitFor(2*1000);
  await page.waitForSelector(VEHICLE_MILEAGE_SELECTOR, {timeout: 181000});
  await page.click(VEHICLE_MILEAGE_SELECTOR);
  await page.select(VEHICLE_MILEAGE_SELECTOR, ANNUAL_MILEAGE_RESPONSE);
  // set peak usage
  if(JSON_DATA.quoteObject.vehicle['-used_peak_time'].toUpperCase() == 'Y') {
    await page.waitFor(2*1000);
    await page.waitForSelector(PEAK_TIME_YES_SELECTOR, {timeout: 181000});
    await page.click(PEAK_TIME_YES_SELECTOR);
  }
  else {
    await page.waitFor(2*1000);
    await page.waitForSelector(PEAK_TIME_NO_SELECTOR, {timeout: 181000});
    await page.click(PEAK_TIME_NO_SELECTOR);
  }
  // fill proposer personal details
  const
    FIRST_NAME = generateDummyName(),
    SURNAME = generateDummyName(),
    BIRTHDATE = JSON_DATA.quoteObject.subject['-DoB'],
    BIRTHDATE_ARR = BIRTHDATE.split('-'),
    BIRTH_YEAR = BIRTHDATE_ARR[0],
    BIRTH_MONTH = BIRTHDATE_ARR[1],
    BIRTH_DAY = BIRTHDATE_ARR[2],
    EMAIL_FRAG_1 = generateDummyName(),
    EMAIL_FRAG_2 = EMAIL_FRAG_1.substring(0, 4),
    EMAIL = `${EMAIL_FRAG_1}@${EMAIL_FRAG_2}.com`;
  // first name
  await page.waitFor(2*1000);
  await page.waitForSelector(FORENAME_SELECTOR, {timeout: 181000});
  await page.type(FORENAME_SELECTOR, FIRST_NAME, {delay: 100});
  // surname
  await page.waitFor(2*1000);
  await page.waitForSelector(SURNAME_SELECTOR, {timeout: 181000});
  await page.type(SURNAME_SELECTOR, SURNAME, {delay: 100});
  // birth day
  await page.waitFor(2*1000);
  await page.waitForSelector(BIRTH_DAY_SELECTOR, {timeout: 181000});
  await page.type(BIRTH_DAY_SELECTOR, BIRTH_DAY, {delay: 100});
  // birth month
  await page.waitFor(2*1000);
  await page.waitForSelector(BIRTH_MONTH_SELECTOR, {timeout: 181000});
  await page.type(BIRTH_MONTH_SELECTOR, BIRTH_MONTH, {delay: 100});
  // birth year
  await page.waitFor(2*1000);
  await page.waitForSelector(BIRTH_YEAR_SELECTOR, {timeout: 181000});
  await page.type(BIRTH_YEAR_SELECTOR, BIRTH_YEAR, {delay: 100});
  // email address
  await page.waitFor(2*1000);
  await page.waitForSelector(EMAIL_SELECTOR, {timeout: 181000});
  await page.type(EMAIL_SELECTOR, EMAIL, {delay: 100});
  // no updates
  await page.waitFor(2*1000);
  await page.waitForSelector(NO_UPDATES_SELECTOR, {timeout: 181000});
  await page.click(NO_UPDATES_SELECTOR);
  // first continuation
  await page.waitFor(2*1000);
  await page.waitForSelector(CONTINUE_1_SELECTOR, {timeout: 181000});
  await page.click(CONTINUE_1_SELECTOR);
  // PAGE 2
  await page.waitFor(5*1000);
  // provide basic info on subject
  const
    TITLE = JSON_DATA.quoteObject.subject.identity['-title'],
    MARITAL_STATUS = JSON_DATA.quoteObject.subject['-marital_status'],
    RESIDENCE_SINCE_DATE = JSON_DATA.quoteObject.subject['-resident_since'],
    RESIDENCE_SINCE_DATE_ARR = RESIDENCE_SINCE_DATE.split('-'),
    RESIDENCE_SINCE_DATE_MONTH = RESIDENCE_SINCE_DATE_ARR[1],
    RESIDENCE_SINCE_DATE_YEAR = RESIDENCE_SINCE_DATE_ARR[0],
    PHONE_NUM = JSON_DATA.quoteObject.subject.telephone['-number'],
    GENDER = JSON_DATA.quoteObject.subject.identity['-gender'];
  // title
  await page.waitFor(2*1000);
  await page.waitForSelector(TITLE_SELECTOR, {timeout: 181000});
  const TITLE_RESPONSE = HELPERS.getTitle(TITLE, GENDER);
  await page.click(TITLE_SELECTOR);
  await page.select(TITLE_SELECTOR, TITLE_RESPONSE);
  // marital status
  await page.waitFor(2*1000);
  await page.waitForSelector(MARITAL_STATUS_SELECTOR, {timeout: 181000});
  const MARITAL_STATUS_RESPONSE = HELPERS.getMaritalStatus(MARITAL_STATUS);
  await page.click(MARITAL_STATUS_SELECTOR);
  await page.select(MARITAL_STATUS_SELECTOR, MARITAL_STATUS_RESPONSE);
  // residence since month
  await page.waitFor(2*1000);
  await page.waitForSelector(RESIDENT_SINCE_MONTH_SELECTOR, {timeout: 181000});
  await page.type(RESIDENT_SINCE_MONTH_SELECTOR, RESIDENCE_SINCE_DATE_MONTH, {delay: 100});
  // residence since year
  await page.waitFor(2*1000);
  await page.waitForSelector(RESIDENT_SINCE_YEAR_SELECTOR, {timeout: 181000});
  await page.type(RESIDENT_SINCE_YEAR_SELECTOR, RESIDENCE_SINCE_DATE_YEAR, {delay: 100});
  // telephone number
  await page.waitFor(2*1000);
  await page.waitForSelector(PHONE_NUMBER_SELECTOR, {timeout: 181000});
  await page.type(PHONE_NUMBER_SELECTOR, PHONE_NUM, {delay: 100});
  // confirm home ownership
  if(JSON_DATA.quoteObject.subject['-homeowner'].toUpperCase() == 'Y') {
    await page.waitFor(2*1000);
    await page.waitForSelector(HOME_OWNER_YES_SELECTOR, {timeout: 181000});
    await page.click(HOME_OWNER_YES_SELECTOR);
  }
  else {
    await page.waitFor(2*1000);
    await page.waitForSelector(HOME_OWNER_NO_SELECTOR, {timeout: 181000});
    await page.click(HOME_OWNER_NO_SELECTOR);
  }
  // select number of children
  const CHILDREN_NUMBER = JSON_DATA.quoteObject.subject['-children'];
  const CHILDREN_NUMBER_OPTIONS = await page.$eval(CHILDREN_NUMBER_SELECTOR, target => {
    let res = [];
    const OPTIONS = target.children
    for (let i = 0; i < OPTIONS.length; i++) {
      const option = OPTIONS[i].children;
      for (let j = 0; j < option.length; j++) {
        const opt = option[j];
        const label = opt.querySelector('label > span').innerHTML;
        const value = `#${opt.querySelector('input').getAttribute('id')}`;
        res.push({
          label,
          value
        });
      }
    }

    return res;
  });
  const CHILDREN_NUMBER_RESPONSE = HELPERS.getChildrenNumber(CHILDREN_NUMBER, CHILDREN_NUMBER_OPTIONS);
  await page.waitFor(2*1000);
  await page.waitForSelector(CHILDREN_NUMBER_RESPONSE, {timeout: 181000});
  await page.click(CHILDREN_NUMBER_RESPONSE);
  // set hear about us response
  await page.waitFor(2*1000);
  await page.waitForSelector(HEAR_ABOUT_US_SELECTOR, {timeout: 181000});
  await page.click(HEAR_ABOUT_US_SELECTOR);
  await page.select(HEAR_ABOUT_US_SELECTOR, '27');
  // postcode
  await page.waitFor(2*1000);
  const POST_CODE = JSON_DATA.quoteObject.subject.address['-postcode'];
  await page.waitForSelector(POSTCODE_SELECTOR, {timeout: 181000});
  await page.type(POSTCODE_SELECTOR, POST_CODE, {delay: 100});
  await page.waitFor(2*1000);
  await page.waitForSelector(FIND_ADDRESS_SELECTOR, {timeout: 181000});
  const HOUSE_NUMBER = JSON_DATA.quoteObject.subject.address['-number_name'];
  await page.click(FIND_ADDRESS_SELECTOR);
  await page.waitForSelector(ADDRESS_LIST_SELECTOR, {timeout: 181000});
  const HOUSE_SELECTOR = await page.$eval(ADDRESS_LIST_SELECTOR, (target, HOUSE_NUMBER) => {
    let list = target.querySelectorAll('li');
    let idx;
    let SELECTOR_STRING;
    list.forEach(function (el, IDX) {
        const CANDIDATE = el.innerText;
        const CANDIDATE_ARRAY = CANDIDATE.split(' ');
        const MATCHING_NUMBER = CANDIDATE_ARRAY[0];
        if(MATCHING_NUMBER == HOUSE_NUMBER) {
          idx = IDX;
          const SELECTOR = `#form0 > fieldset.address-details-panel > div.address-list-panel.question-extended > fieldset > div > ul > li:nth-child(${idx + 1})`;
          SELECTOR_STRING = SELECTOR;
          return SELECTOR_STRING;
        }
    });
    return SELECTOR_STRING;
  }, HOUSE_NUMBER);
  // select matching home
  if(!!HOUSE_SELECTOR) {
    await page.click(HOUSE_SELECTOR);
  }
  else {
    process.exit(1);
  }
  // confirm kept over night
  await page.waitFor(2*1000);
  await page.waitForSelector(KEPT_OVERNIGHT_HERE_SELECTOR, {timeout: 181000});
  await page.click(KEPT_OVERNIGHT_HERE_SELECTOR);
  // set number of cars in household
  const HOUSEHOLD_VEHICLES = JSON_DATA.quoteObject.subject.address['-total_vehicles'];
  const HOUSEHOLD_VEHICLES_OPTIONS = await page.$eval(CAR_NUMBER_SELECTOR, target => {
    let res = [];
    const OPTIONS = target.children;
    for (let i = 0; i < OPTIONS.length; i++) {
      const option = OPTIONS[i].children;
      for (let j = 0; j < option.length; j++) {
        const opt = option[j];
        const label = opt.querySelector('label > span').innerHTML;
        const value = `#${opt.querySelector('input').getAttribute('id')}`;
        res.push({
          label,
          value
        });
      }
    }

    return res;
  });
  const HOUSEHOLD_VEHICLES_RESPONSE = HELPERS.getTotalHouseholdVehicles(HOUSEHOLD_VEHICLES, HOUSEHOLD_VEHICLES_OPTIONS);
  // console.log(`${HOUSEHOLD_VEHICLES_RESPONSE}`);
  await page.waitFor(2*1000);
  await page.waitForSelector(HOUSEHOLD_VEHICLES_RESPONSE, {timeout: 181000});
  await page.click(HOUSEHOLD_VEHICLES_RESPONSE);
  // set full time occupation status
  const EMPLOYMENT_STATUS = JSON_DATA.quoteObject.subject.employment[0]['-status'];
  const EMPLOYMENT_STATUS_OPTIONS = await page.$eval(EMPLOYMENT_STATUS_SELECTOR,
    (target, EMPLOYMENT_STATUS_OPTION_SELECTOR) => {
      let res = [];
      const OPTIONS = target.children
      for (let i = 0; i < OPTIONS.length-1; i++) {
        const option = OPTIONS[i];
        const label = option.querySelector('label > span > span').innerHTML.toLowerCase();
        const value = EMPLOYMENT_STATUS_OPTION_SELECTOR.replace('INDEX', i+1);
        res.push({
          label,
          value
        })
      }

      return res;
    }, EMPLOYMENT_STATUS_OPTION_SELECTOR
  );
  const EMPLOYMENT_STATUS_RESPONSE = HELPERS.getFullTimeOccupationStatus(EMPLOYMENT_STATUS, EMPLOYMENT_STATUS_OPTIONS);
  // console.log(`${EMPLOYMENT_STATUS_RESPONSE}`);
  await page.waitFor(2*1000);
  await page.waitForSelector(EMPLOYMENT_STATUS_RESPONSE, {timeout: 181000});
  await page.click(EMPLOYMENT_STATUS_RESPONSE);
  // set occupation role
  await page.waitFor(2*1000);
  await page.waitForSelector(FULLTIME_OCCUPATION_INPUT_SELECTOR, {timeout: 181000});
  const
    OCCUPATION_ROLE = JSON_DATA.quoteObject.subject.employment[0].occupation['-role'],
    OCCUPATION_ROLE_TRIGGER = OCCUPATION_ROLE.substr(0, 2);
  let OCCUPATION_INDUSTRY = JSON_DATA.quoteObject.subject.employment[0].occupation['-industry'];
  OCCUPATION_INDUSTRY = OCCUPATION_INDUSTRY.toLowerCase();
  const OCCUPATION_INDUSTRY_TRIGGER = OCCUPATION_INDUSTRY.substr(0, 2);
  await page.type(FULLTIME_OCCUPATION_INPUT_SELECTOR, OCCUPATION_ROLE_TRIGGER, {delay: 100});
  await page.waitForSelector(FULLTIME_OCCUPATION_LIST_SELECTOR, {timeout: 181000});
  const OCCUPATION_ROLE_SELECTOR = await page.$eval(FULLTIME_OCCUPATION_LIST_SELECTOR, (target, OCCUPATION_ROLE) => {
    let list = target.querySelectorAll('li');
    let idx;
    let SELECTOR_STRING;
    list.forEach(function (el, IDX) {
        let CANDIDATE = el.innerText;
        console.log(`candidate: ${CANDIDATE}`);
        if(CANDIDATE.toLowerCase() == OCCUPATION_ROLE.toLowerCase()) {
          idx = IDX;
          const SELECTOR = `#form0 > fieldset:nth-child(4) > div.full-time-employment-question > div.popout.employment-details.hide-by-default > div.question.first.popout-question.occupation-search.hide-by-default > span:nth-child(4) > div > ul.occupation-list.multi-select-list.hide-by-default > li:nth-child(${idx + 1})`;
          SELECTOR_STRING = SELECTOR;
          return SELECTOR_STRING;
        }
    });
    return SELECTOR_STRING;
  }, OCCUPATION_ROLE);
  // select matching occupation role
  if(!!OCCUPATION_ROLE_SELECTOR) {
    await page.click(OCCUPATION_ROLE_SELECTOR);
  }
  else {
    process.exit(1);
  }
  // set occupation industry
  await page.waitFor(2*1000);
  await page.type(TYPE_OF_BUSINESS_INPUT_SELECTOR, OCCUPATION_INDUSTRY_TRIGGER, {delay: 100});
  await page.waitForSelector(TYPE_OF_BUSINESS_LIST_SELECTOR, {timeout: 181000});
  const OCCUPATION_INDUSTRY_SELECTOR = await page.$eval(TYPE_OF_BUSINESS_LIST_SELECTOR, (target, OCCUPATION_INDUSTRY) => {
    let list = target.querySelectorAll('li');
    let idx;
    const REGEX = /[^(a-z)]/g;
    let SELECTOR_STRING;
    list.forEach(function (el, IDX) {
        let CANDIDATE = el.innerText;
        CANDIDATE = CANDIDATE.toLowerCase();
        CANDIDATE = CANDIDATE.replace(REGEX, ' ');
        const INDUSTRY = OCCUPATION_INDUSTRY.replace(REGEX, ' ');
        console.log(`candidate: ${CANDIDATE}`);
        console.log(`INDUSTRY: ${INDUSTRY}`);
        let
          i = INDUSTRY.length,
          j = 0,
          l = 0;
          k = CANDIDATE.length,
          len = CANDIDATE.length;

        while ((k > 0) && (l < i)) {
          if(CANDIDATE.charAt(j) == INDUSTRY.charAt(l)) {
            k--;
            j = len - k;
            l++;
          }
          else if((CANDIDATE.charAt(j) != INDUSTRY.charAt(l)) && (i > 0)) {
            k--;
            j = len - k;
          }
        }
        if(l == i) {
          console.log('match!!');
          idx = IDX;
          const SELECTOR = `#form0 > fieldset:nth-child(4) > div.full-time-employment-question > div.popout.employment-details.hide-by-default > div.question.first.popout-question.occupation-search.hide-by-default > span:nth-child(4) > div > ul.business-list.multi-select-list.hide-by-default > li:nth-child(${idx + 1})`;
          SELECTOR_STRING = SELECTOR;
          console.log(`SELECTOR_STRING: ${SELECTOR_STRING}`);
          return SELECTOR_STRING;
        }
    });
    return SELECTOR_STRING;
  }, OCCUPATION_INDUSTRY);
  //console.log(`OCCUPATION_INDUSTRY_SELECTOR: ${OCCUPATION_INDUSTRY_SELECTOR}`);
  // select matching occupation industry
  if(!!OCCUPATION_INDUSTRY_SELECTOR) {
    await page.click(OCCUPATION_INDUSTRY_SELECTOR);
  }
  else {
    process.exit(1);
  }
  // no part time employment
  await page.waitFor(2*1000);
  await page.waitForSelector(NO_PART_TIME_EMPLOYMENT_SELECTOR, {timeout: 181000});
  await page.click(NO_PART_TIME_EMPLOYMENT_SELECTOR);
  // continue
  await page.waitFor(2*1000);
  await page.click(CONTINUE_2_SELECTOR);
  // PAGE 3
  // set type of driving license
  await page.waitFor(5*1000);
  const WHERE_ISSUED = JSON_DATA.quoteObject.subject.drivingLicence['-where_issued'].toUpperCase();
  const DRIVING_LICENSE_TYPE = JSON_DATA.quoteObject.subject.drivingLicence['-type'].toLowerCase();
  const DRIVING_LICENSE_TYPE_OPTIONS = await page.$eval(DRIVING_LICENSE_TYPE_SELECTOR,
    (target, DRIVING_LICENSE_TYPE_OPTION_SELECTOR) => {
    let res = [];
    const OPTIONS = target.children
    for (let i = 0; i < OPTIONS.length-1; i++) {
      const option = OPTIONS[i];
      const label = option.querySelector('label > span > span').innerHTML.toLowerCase();
      const value = DRIVING_LICENSE_TYPE_OPTION_SELECTOR.replace('INDEX', i+1);
      res.push({
        label,
        value
      })
    }

    return res;
  }, DRIVING_LICENSE_TYPE_OPTION_SELECTOR);
  const DRIVING_LICENSE_TYPE_RESPONSE = HELPERS.getDrivingLicenseType(DRIVING_LICENSE_TYPE, DRIVING_LICENSE_TYPE_OPTIONS, WHERE_ISSUED);
  // console.log(`${DRIVING_LICENSE_TYPE_RESPONSE}`);
  await page.waitFor(5*1000);
  await page.waitForSelector(DRIVING_LICENSE_TYPE_RESPONSE, {timeout: 181000});
  await page.click(DRIVING_LICENSE_TYPE_RESPONSE);
  // select timeframe for holding license
  let thisYear = new Date();
  thisYear = thisYear.getFullYear();
  let licenseYear = JSON_DATA.quoteObject.subject.drivingLicence['-date_issued'];
  const LICENSE_YEAR_ARRAY = licenseYear.split('-');
  licenseYear = LICENSE_YEAR_ARRAY[2];
  if(licenseYear.length == 2) {
    licenseYear = '19' + licenseYear;
  }
  const LICENSE_YEAR_DURATION_RESPONSE = HELPERS.getLicenseDuration(licenseYear, thisYear);
  await page.waitFor(2*1000);
  await page.waitForSelector(DRIVING_LICENSE_DURATION_SELECTOR, {timeout: 181000});
  await page.click(DRIVING_LICENSE_DURATION_SELECTOR);
  await page.select(DRIVING_LICENSE_DURATION_SELECTOR, LICENSE_YEAR_DURATION_RESPONSE);
  // set DLVA response
  if(JSON_DATA.quoteObject.subject.drivingLicence['-medical_conditions'].toUpperCase() == 'Y') {
    await page.waitFor(2*1000);
    await page.waitForSelector(DLVA_YES_SELECTOR, {timeout: 181000});
    await page.click(DLVA_YES_SELECTOR);
  }
  else {
    await page.waitFor(2*1000);
    await page.waitForSelector(DLVA_NO_SELECTOR, {timeout: 181000});
    await page.click(DLVA_NO_SELECTOR);
  }
  // set no claims bonus value
  const DRIVING_LICENSE_NO_CLAIMS = JSON_DATA.quoteObject.subject.drivingLicence['-additional_quals'];
  const DRIVING_LICENSE_NO_CLAIMS_OPTIONS = await page.$eval(DRIVING_LICENSE_NO_CLAIMS_SELECTOR, target => {
    let res = [];
    const OPTIONS = target.children
    for (let i = 1; i < OPTIONS.length; i++) {
      const option = OPTIONS[i];
      res.push({
        label: option.innerHTML,
        value: option.getAttribute('value')
      })
    }

    return res;
  });
  const DRIVING_LICENSE_NO_CLAIMS_RESPONSE = HELPERS.getDrivingLicenseNoClaims(
    DRIVING_LICENSE_NO_CLAIMS, DRIVING_LICENSE_NO_CLAIMS_OPTIONS);
  // console.log(`${DRIVING_LICENSE_NO_CLAIMS_RESPONSE}`);
  await page.waitFor(2*1000);
  await page.waitForSelector(DRIVING_LICENSE_NO_CLAIMS_SELECTOR, {timeout: 181000});
  await page.click(DRIVING_LICENSE_NO_CLAIMS_SELECTOR);
  await page.select(DRIVING_LICENSE_NO_CLAIMS_SELECTOR, DRIVING_LICENSE_NO_CLAIMS_RESPONSE);
  // set IAM certificate default response
  await page.waitFor(10*1000);
  await page.waitForSelector(NO_IAM_CERT_SELECTOR, {timeout: 181000});
  await page.click(NO_IAM_CERT_SELECTOR);
  // set driving other cars response
  if(JSON_DATA.quoteObject.subject.drivingLicence['-other_vehicles'].toUpperCase() == 'Y') {
    await page.waitFor(2*1000);
    await page.waitForSelector(YES_DRIVE_OTHER_CARS_SELECTOR, {timeout: 181000});
    await page.click(YES_DRIVE_OTHER_CARS_SELECTOR);
  }
  else {
    await page.waitFor(2*1000);
    await page.waitForSelector(NO_DRIVE_OTHER_CARS_SELECTOR, {timeout: 181000});
    await page.click(NO_DRIVE_OTHER_CARS_SELECTOR);
  }
  // set provision of driving license details default response
  await page.waitFor(2*1000);
  await page.waitForSelector(LICENSE_DETAILS_NO_SELECTOR, {timeout: 181000});
  await page.click(LICENSE_DETAILS_NO_SELECTOR);
  // set default responses to claims and convictions
  await page.waitFor(2*1000);
  await page.waitForSelector(NO_CLAIMS_SELECTOR, {timeout: 181000});
  await page.click(NO_CLAIMS_SELECTOR);
  await page.waitFor(2*1000);
  await page.waitForSelector(NO_CONVICTIONS_SELECTOR, {timeout: 181000});
  await page.click(NO_CONVICTIONS_SELECTOR);
  await page.waitFor(2*1000);
  await page.waitForSelector(NO_NONMOTORING_CONVICTIONS_SELECTOR, {timeout: 181000});
  await page.click(NO_NONMOTORING_CONVICTIONS_SELECTOR);
  // continue
  await page.waitFor(2*1000);
  await page.click(CONTINUE_3_SELECTOR);
  // PAGE 4
  // set policy cover start date
  await page.waitFor(5*1000);
  let COVER_START_LAG = JSON_DATA.quoteObject.policy['-quote_cover_start'];
  let thisDay = new Date();
  thisDay = thisDay.getDate();
  COVER_START_LAG = Number(COVER_START_LAG);
  await page.waitForSelector(COVER_START_PICKER_SELECTOR, {timeout: 181000});
  await page.click(COVER_START_PICKER_SELECTOR);
  let inPartialMonth = await page.waitForSelector(PART_MONTH_SELECTOR, {timeout: 181000});
  if(!!inPartialMonth) {
    let coverStartDateFlag = await page.$eval('#ui-datepicker-div > div.ui-datepicker-group.ui-datepicker-group-first', (target, COVER_START_LAG, thisDay) => {
      let
        TARGET_DAY,
        GOT_DATE;
      if((thisDay + COVER_START_LAG) <= 30) {
        TARGET_DAY = thisDay + COVER_START_LAG;
      }
      else {
        TARGET_DAY = thisDay + COVER_START_LAG - 30;
      }
      const CANDIDATES = target.querySelectorAll('[data-handler="selectDay"]');
      CANDIDATES.forEach(CANDIDATE => {
        if(Number(CANDIDATE.innerText.split('\n')[0]) == TARGET_DAY) {
          CANDIDATE.click();
          GOT_DATE = true;
        }
      });
      return GOT_DATE;
    }, COVER_START_LAG, thisDay);

    if(!coverStartDateFlag) {
      coverStartDateFlag = await page.$eval('#ui-datepicker-div > div.ui-datepicker-group.ui-datepicker-group-last', (target, COVER_START_LAG, thisDay) => {
        let
          TARGET_DAY,
          GOT_DATE;
        if((thisDay + COVER_START_LAG) <= 30) {
          TARGET_DAY = thisDay + COVER_START_LAG;
        }
        else {
          TARGET_DAY = thisDay + COVER_START_LAG - 30;
        }
        const CANDIDATES = target.querySelectorAll('[data-handler="selectDay"]');
        CANDIDATES.forEach(CANDIDATE => {
          if(Number(CANDIDATE.innerText.split('\n')[0]) == TARGET_DAY) {
            CANDIDATE.click();
            GOT_DATE = true;
          }
        });
        return GOT_DATE;
      }, COVER_START_LAG, thisDay);
    }
  }
  else {
    const FULL_MONTH = await page.waitForSelector(FULL_MONTH_SELECTOR, {timeout: 181000});
    if(!!FULL_MONTH) {
      await page.$eval(FULL_MONTH_SELECTOR, (target, COVER_START_LAG, thisDay) => {
        let
          TARGET_DAY,
          GOT_DATE;
        if((thisDay + COVER_START_LAG) <= 30) {
          TARGET_DAY = thisDay + COVER_START_LAG;
        }
        else {
          TARGET_DAY = thisDay + COVER_START_LAG - 30;
        }
        const CANDIDATES = target.querySelectorAll('[data-handler="selectDay"]');
        CANDIDATES.forEach(CANDIDATE => {
          if(Number(CANDIDATE.innerText.split('\n')[0]) == TARGET_DAY) {
            CANDIDATE.click();
          }
        });
      }, COVER_START_LAG, thisDay);
    }
  }
  // set NO RENEWAL reminder
  await page.waitFor(2*1000);
  await page.waitForSelector(NO_RENEWAL_REMINDER_SELECTOR, {timeout: 181000});
  await page.click(NO_RENEWAL_REMINDER_SELECTOR);
  // accept INSURANCE cover
  const COVER_TYPE = JSON_DATA.quoteObject.policy['-cover_type'].toLowerCase();
  const COVER_TYPE_OPTIONS = await page.$eval(COVER_TYPE_SELECTOR,
    (target, COVER_TYPE_OPTION_SELECTOR) => {
    let res = [];
    const OPTIONS = target.children
    for (let i = 0; i < OPTIONS.length; i++) {
      const option = OPTIONS[i];
      const label = option.querySelector('label > span > span').innerHTML.toLowerCase();
      const value = COVER_TYPE_OPTION_SELECTOR.replace('INDEX', i+1);
      res.push({
        label,
        value
      })
    }

    return res;
  }, COVER_TYPE_OPTION_SELECTOR);
  const COVER_TYPE_RESPONSE = HELPERS.getCoverType(COVER_TYPE, COVER_TYPE_OPTIONS);
  // console.log(`${COVER_TYPE_RESPONSE}`);
  await page.waitFor(2*1000);
  await page.waitForSelector(COVER_TYPE_RESPONSE, {timeout: 181000});
  await page.click(COVER_TYPE_RESPONSE);
  // accept VOLUNTARY EXCESS
  const VOLUNTARY_EXCESS = JSON_DATA.quoteObject.policy['-voluntary_excess'].substr(1);
  const VOLUNTARY_EXCESS_OPTIONS = await page.$eval(VOLUNTARY_EXCESS_SELECTOR,
    (target, VOLUNTARY_EXCESS_OPTION_SELECTOR) => {
    let res = [];
    const OPTIONS = target.children
    for (let i = 0; i < OPTIONS.length; i++) {
      const option = OPTIONS[i];
      const selector = VOLUNTARY_EXCESS_OPTION_SELECTOR.replace('INDEX', i+1);
      res.push(selector);
    }

    return res;
  }, VOLUNTARY_EXCESS_OPTION_SELECTOR);
  const VOLUNTARY_EXCESS_RESPONSE = HELPERS.getVoluntaryExcess(COVER_TYPE, VOLUNTARY_EXCESS, VOLUNTARY_EXCESS_OPTIONS);
  await page.waitFor(2*1000);
  await page.waitForSelector(VOLUNTARY_EXCESS_RESPONSE, {timeout: 181000});
  await page.click(VOLUNTARY_EXCESS_RESPONSE);
  // set response for INSURANCE DECLINED
  await page.waitFor(2*1000);
  await page.waitForSelector(NO_INSURANCE_DENIED_SELECTOR , {timeout: 181000});
  await page.click(NO_INSURANCE_DENIED_SELECTOR);
  // set RENEWAL PRICE
  const RENEWAL_PRICE = JSON_DATA.quoteObject.policy['-renewal_price'];
  await page.waitFor(2*1000);
  await page.waitForSelector(RENEWAL_PRICE_SELECTOR, {timeout: 181000});
  await page.type(RENEWAL_PRICE_SELECTOR, RENEWAL_PRICE, {delay: 100});
  // set policy payment schedule
  const PAYMENT_TERMS = JSON_DATA.quoteObject.policy['-payment_terms'].toLowerCase();
  const PAYMENT_TERMS_OPTIONS = await page.$eval(PAY_SELECTOR, (target, PAY_OPTION_SELECTOR) => {
    let res = [];
    const OPTIONS = target.children
    for (let i = 0; i < OPTIONS.length; i++) {
      const option = OPTIONS[i];
      const label = option.querySelector('label > span > span').innerHTML.toLowerCase();
      const value = PAY_OPTION_SELECTOR.replace('INDEX', i+1);
      res.push({
        label,
        value
      })
    }

    return res;
  }, PAY_OPTION_SELECTOR);
  const PAYMENT_TERMS_RESPONSE = HELPERS.getPaymentTerms(PAYMENT_TERMS, PAYMENT_TERMS_OPTIONS);
  // console.log(`${PAYMENT_TERMS_RESPONSE}`);
  await page.waitFor(2*1000);
  await page.waitForSelector(PAY_SELECTOR, {timeout: 181000});
  await page.click(PAYMENT_TERMS_RESPONSE);
  // reject contact offer
  await page.waitFor(2*1000);
  await page.waitForSelector(NO_CONTACT_ME_SELECTOR, {timeout: 181000});
  await page.click(NO_CONTACT_ME_SELECTOR);
  // reject breakdown cover
  await page.waitFor(2*1000);
  await page.waitForSelector(NO_BREAKDOWN_COVER_SELECTOR, {timeout: 181000});
  await page.click(NO_BREAKDOWN_COVER_SELECTOR);
  // set default response to home insurance
  await page.waitFor(2*1000);
  await page.waitForSelector(NO_HOME_INSURANCE_SELECTOR, {timeout: 181000});
  await page.click(NO_HOME_INSURANCE_SELECTOR);
  await page.select(NO_HOME_INSURANCE_SELECTOR, '-1');
  // set SIGN IN and SECURITY details
  const
    SIGN_IN_PWD = 'QUOTE1234!',
    SIGN_IN_CLUE = 'standard',
    MOTHERS_MAIDEN_NAME = 'maiden';
  // PASSWORD
  await page.waitFor(2*1000);
  await page.waitForSelector(CREATE_PWD_SELECTOR, {timeout: 181000});
  await page.type(CREATE_PWD_SELECTOR, SIGN_IN_PWD, {delay: 100});
  // CONFIRM PASSWORD
  await page.waitFor(2*1000);
  await page.waitForSelector(RETYPE_PWD_SELECTOR, {timeout: 181000});
  await page.type(RETYPE_PWD_SELECTOR, SIGN_IN_PWD, {delay: 100});
  // CLUE
  await page.waitFor(2*1000);
  await page.waitForSelector(PWD_CLUE_SELECTOR, {timeout: 181000});
  await page.type(PWD_CLUE_SELECTOR, SIGN_IN_CLUE, {delay: 100});
  // MOTHER'S MAIDEN NAME
  await page.waitFor(2*1000);
  await page.waitForSelector(MAIDEN_NAME_SELECTOR, {timeout: 181000});
  await page.type(MAIDEN_NAME_SELECTOR, MOTHERS_MAIDEN_NAME, {delay: 100});
  // uncheck REMEMBER ME
  await page.waitFor(2*1000);
  await page.waitForSelector(KEEP_SIGNED_IN_SELECTOR, {timeout: 181000});
  const IS_CHECKED = await page.$eval(KEEP_SIGNED_IN_SELECTOR, target => {
    return target.checked;
  });
  if(IS_CHECKED) {
    await page.click(KEEP_SIGNED_IN_SELECTOR);
  }
  // accept T&C and GET QUOTES
  await page.waitFor(2*1000);
  await page.waitForSelector(GET_QUOTES_SELECTOR_2, {timeout: 181000});
  await page.click(GET_QUOTES_SELECTOR_2);

  // QUOTES
  // selectors
  const
    RESULTS_SELECTOR = 'div.result-item',
    RESULT_ITEM_IMG_SELECTOR = 'div.result-item__brand > div > img',
    FAILED_BRANDS_SELECTOR = 'section.failed-brands',
    FAILED_BRANDS_IMG_SELECTOR = 'span.logo-wrapper > img';
  // handle failed brands
  await page.waitFor(30*1000);
  await page.waitForSelector(FAILED_BRANDS_SELECTOR, {timeout: 181000});
  await page.$eval(FAILED_BRANDS_SELECTOR, (target, FAILED_BRANDS_IMG_SELECTOR) => {
    const BRANDS_ARRAY = target.querySelectorAll('p');
    BRANDS_ARRAY.forEach(brand => {
      const
        IMG_URL = brand.querySelector(FAILED_BRANDS_IMG_SELECTOR).src,
        BRAND_NAME = brand.querySelector(FAILED_BRANDS_IMG_SELECTOR).alt,
        DATA = {
          type: 'failed-brand',
          brand: BRAND_NAME,
          img: IMG_URL
        },
        OUTPUT = JSON.stringify(DATA);
      return console.log(OUTPUT);
    });
  }, FAILED_BRANDS_IMG_SELECTOR);
  // handle results brands
  await page.waitFor(10*1000);
  await page.waitForSelector(RESULTS_SELECTOR, {timeout: 181000});
  await page.$$eval(RESULTS_SELECTOR, (targets, RESULT_ITEM_IMG_SELECTOR) => {
    targets.forEach((brand, idx) => {
      let
        included = [],
        notIncluded = [];
      const
        IMG_URL = brand.querySelector(RESULT_ITEM_IMG_SELECTOR).src,
        BRAND_NAME = brand.querySelector(RESULT_ITEM_IMG_SELECTOR).alt,
        uID = brand.id,
        SITE_RESULT_URL = `https://car.gocompare.com/moreinfo/index/${uID}/${idx}/1?sort=1&features=`,
        QUOTE_PRICE = brand.querySelector('div.result-item__price > span.price').innerText,
        TOTAL_EXCESS = brand.querySelector('div.result-item__price > span.excess > span').innerText,
        FEATURES_CONTAINER = brand.querySelector('div.result-item__features'),
        FEATURES = FEATURES_CONTAINER.querySelectorAll('div.badge__info > p');
      FEATURES.forEach(feature => {
        if(feature.className == "badge__text feature-inactive") {
          return notIncluded.push(feature.innerText);
        }
        else {
          return included.push(feature.innerText);
        }
      });

      const
        DATA = {
          type: 'result-brand',
          brand: BRAND_NAME,
          img: IMG_URL,
          site: SITE_RESULT_URL,
          quotePrice: QUOTE_PRICE,
          totalExcess: TOTAL_EXCESS,
          includedFeatures: included,
          excludedFeatures: notIncluded
        },
        OUTPUT = JSON.stringify(DATA);
      return console.log(OUTPUT);
    });
  }, RESULT_ITEM_IMG_SELECTOR);
  return setTimeout(async () => {
    await page.close();
    await browser.close();
    return process.exit(0);
  }, 15000);
}

bot()
  .catch(err => console.error(err));
