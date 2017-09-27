import * as types from './actionTypes';

export function marketSelectionChanged(selectedMarketIds) {
  return { type: types.MARKET_SELECTION_CHANGED, selectedMarketIds };
}

