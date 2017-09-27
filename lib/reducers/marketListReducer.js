import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function marketListReducer(state = initialState.marketList, action) {
  switch (action.type) {
    case types.ADD_MARKET_SELECTION:{
      return { 
        selectedMarketIds: [...state.selectedMarketIds, action.marketId]
      };
    }
    case types.REMOVE_MARKET_SELECTION: {
      let newArray = [...state.selectedMarketIds];
      const index = newArray.indexOf(action.marketId);
      if (index > -1) {
        newArray.splice(index, 1);
      }
      return { 
        selectedMarketIds: newArray
      };
    }
    default:
      return state;  
  }
}