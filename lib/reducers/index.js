import {combineReducers} from 'redux';
import marketChart from './marketChartReducer';

const rootReducer = combineReducers({
  marketChart
});

export default rootReducer;