var pjson = require('../package.json');

const prodConfig = {
  emenuMobileGatewayAPI: 'https://ws.dealertrack.com/api/mobile/v1/emenu',
  dealMobileGatewayAPI: 'https://ws.dealertrack.com/api/mobile/v1/deal',
  baseUrlPath: 'https://fni-static.dealertrack.com/',
  fniMenuDealerApp: 'apps/fni-menu-dealer-app/versions/',
  fniMenuCustApp: 'apps/fni-menu-cust-app/versions/',
  version: pjson.version,
  presentationPortAPI: '',
  printPortAPI: '',
  credentialsFlag: true
  }

module.exports = prodConfig;
