function getLicenseDuration(licenseYear, thisYear) {
  const duration = thisYear - Number(licenseYear);
  let response;
  if(duration < 1) {
    return response = '1137';
  }
  else if(duration == 1) {
    return response = '854';
  }
  else if(duration == 2) {
    return response = '855';
  }
  else if(duration == 3) {
    return response = '856';
  }
  else if(duration == 4) {
    return response = '857';
  }
  else if(duration == 5) {
    return response = '858';
  }
  else if(duration == 6) {
    return response = '859';
  }
  else if(duration == 7) {
    return response = '860';
  }
  else if(duration == 8) {
    return response = '861';
  }
  else if(duration == 9) {
    return response = '862';
  }
  else if(duration == 10) {
    return response = '863';
  }
  else if(duration == 11) {
    return response = '864';
  }
  else if(duration == 12) {
    return response = '865';
  }
  else if(duration == 13) {
    return response = '1810';
  }
  else if(duration == 14) {
    return response = '1811';
  }
  else if(duration == 15) {
    return response = '1812';
  }
  else if(duration == 16) {
    return response = '1813';
  }
  else if(duration == 17) {
    return response = '1814';
  }
  else if(duration == 18) {
    return response = '1815';
  }
  else if(duration == 19) {
    return response = '1816';
  }
  else if(duration >= 20) {
    return response = '1817';
  }
}

module.exports = getLicenseDuration;