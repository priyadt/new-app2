var pjson = require('../package.json');

const devIntConfig = {
  emenuMobileGatewayAPI: 'http://ws.dvi1.dealertrack.com/api/mobile/v1/emenu',
  dealMobileGatewayAPI: 'http://ws.dvi1.dealertrack.com/api/mobile/v1/deal',
  baseUrlPath: 'https://fni-static-np.dealertrack.com/',
  fniMenuDealerApp: 'apps/fni-menu-dealer-app/versions/',
  fniMenuCustApp: 'apps/fni-menu-cust-app/versions/',
  version: pjson.version,
  presentationPortAPI: '',
  printPortAPI: '',
  credentialsFlag: true
}

module.exports = devIntConfig;
