import {combineReducers} from 'redux';
import marketListState from './marketListReducer';

const rootReducer = combineReducers({
  marketListState
});

export default rootReducer;