
// export let dealerData = {};
//
// export function populateDealerData() {
//   dealerData = {
//     dealjacketid: window.dealerData.dealjacketid,
//     dealid: window.dealerData.dealid,
//     deal_type: window.dealerData.deal_type,
//     dealer_code: window.dealerData.dealer_code,
//     user_first: window.dealerData.user_first,
//     user_last: window.dealerData.user_last,
//     deploy_env: (window.dealerData) ? window.dealerData.deploy_env : 'local'
//   }
// }
//
// export function getUserSelectionKey() {
//   return `${window.dealerData.dealjacketid}-${window.dealerData.dealid}`;
// }

export let dealerData = {};

export function populateDealerData() {
  dealerData = {
    dealjacketid: (window.dealerData) ? window.dealerData.dealjacketid : '310200000000006139',
    dealid: (window.dealerData) ? window.dealerData.dealid : '310200000000006140',
    deal_type: (window.dealerData) ? window.dealerData.deal_type : 'RETL',
    dealer_code: (window.dealerData) ? window.dealerData.dealer_code : '1112016',
    user_first: (window.dealerData) ? window.dealerData.user_first : 'First',
    user_last: (window.dealerData) ? window.dealerData.user_last : 'Last',
    deploy_env: (window.dealerData) ? window.dealerData.deploy_env : 'local'
  }
}

export function getUserSelectionKey(){
  return `${(window.dealerData) ? window.dealerData.dealjacketid : '310200000000006139'}-${(window.dealerData) ? window.dealerData.dealid : '310200000000006140'}`;
}
