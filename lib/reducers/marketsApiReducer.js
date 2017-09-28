import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function marketsApiReducer(state = initialState.marketApi, action) {
  switch (action.type) {
    case types.LOAD_MARKETS_SUCCESS:
      return { dataApi: action.dataApi };
    default:
      return state;  
  }
}