import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function marketReducer(state = initialState.market, action) {
  switch (action.type) {
    case types.MARKET_SELECTION_CHANGED:
      debugger;
      return [...state, Object.assign({}, action.market)];
    default:
      return state;  
  }
}