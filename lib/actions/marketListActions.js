import * as types from './actionTypes';

export function addMarketSelection(marketId) {
  return { type: types.ADD_MARKET_SELECTION, marketId };
}

export function removeMarketSelection(marketId) {
  return { type: types.REMOVE_MARKET_SELECTION, marketId };
}

