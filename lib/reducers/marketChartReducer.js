export default function marketChartReducer(state = [], action) {
  switch (action.type) {
    case 'MARKET_SELECTION_CHANGED':
      return [...state, Object.assign({}, action.market)];
    default:
      return state;  
  }
}