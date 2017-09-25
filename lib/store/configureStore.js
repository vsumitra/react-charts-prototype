import { createStore, applyMiddleware } from 'redux';
import rootReducer from 'reducers';
import reduxImmutableStateInvarient from 'redux-immutable-state-invariant';

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(reduxImmutableStateInvarient())
  );
}