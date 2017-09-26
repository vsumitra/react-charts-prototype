import * as types from './actionTypes';

export function loadMarketSuccess(dataApi) {
  return { type: types.LOAD_MARKETS_SUCCESS, dataApi };
}