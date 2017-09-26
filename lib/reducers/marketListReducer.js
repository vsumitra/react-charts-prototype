import * as types from '../actions/actionTypes';
import initialState from './initialState';

function insertItem(array, action) {
  let newArray = array.slice();
  newArray.splice(action.index, 0, action.item);
  return newArray;
}

function removeItem(array, action) {
  let newArray = array.slice();
  newArray.splice(action.index, 1);
  return newArray;
}

function getMarkets(dataApi){
  return dataApi
    ? dataApi.getMarkets()
    : null;
}

function getMarketList(dataApi){
  const markets = getMarkets(dataApi);
  return markets
    ? Object.values(markets).map(function(market) {
      return {
        id: market.id, 
        label: market.label, 
        selected: false
      };
    }) 
    : [];
}

export default function marketListReducer(state = initialState.marketList, action) {
  switch (action.type) {
    case types.LOAD_MARKETS_SUCCESS:
      return { dataApi: action.dataApi, marketList: getMarketList(action.dataApi), selectedMarketIds: [] };
    default:
      return state;  
  }
}