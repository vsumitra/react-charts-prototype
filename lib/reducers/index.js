import {combineReducers} from 'redux';
import marketListState from './marketListReducer';
import marketState from './marketReducer';

const rootReducer = combineReducers({
  marketState,
  marketListState
});

export default rootReducer;