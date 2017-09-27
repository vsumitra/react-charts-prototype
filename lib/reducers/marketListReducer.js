import * as types from '../actions/actionTypes';
import initialState from './initialState';

function unique(arr) {
  var u = {}, a = [];
  for(var i = 0, l = arr.length; i < l; ++i){
    if(!u.hasOwnProperty(arr[i])) {
      a.push(arr[i]);
      u[arr[i]] = 1;
    }
  }
  return a;
}

export default function marketListReducer(state = initialState.marketList, action) {
  switch (action.type) {
    case types.MARKET_SELECTION_CHANGED:
      return { 
        selectedMarketIds: action.selectedMarketIds
      };
    default:
      return state;  
  }
}