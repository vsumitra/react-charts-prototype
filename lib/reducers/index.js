import {combineReducers} from 'redux';
import marketListState from './marketListReducer';
import marketsApiState from './marketsApiReducer';
const rootReducer = combineReducers({
  marketListState,
  marketsApiState
});

export default rootReducer;