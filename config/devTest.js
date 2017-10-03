var pjson = require('../package.json');

const devTestConfig = {
  emenuMobileGatewayAPI: 'http://sfizvp.devtest1.qts.fni:6110/api/mobile/v1/emenu',
  dealMobileGatewayAPI: 'http://sfizvp.devtest1.qts.fni:6110/api/mobile/v1/deal',
  baseUrlPath: 'https://fni-static-np.dealertrack.com/',
  fniMenuDealerApp: 'apps/fni-menu-dealer-app/versions/',
  fniMenuCustApp: 'apps/fni-menu-cust-app/versions/',
  version: pjson.version,
  presentationPortAPI: '',
  printPortAPI: '',
  credentialsFlag: true
}

module.exports = devTestConfig;
