import * as types from './actionTypes';

export function marketSelectionChanged(market) {
  return { type: types.MARKET_SELECTION_CHANGED, market };
}

