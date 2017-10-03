import {ReduxAction} from '../types/reducers'
import Constants from '../constants/gettingStarted'
import {GettingStartedState, GettingStartedReducerState} from './../types/gettingStarted'

const initialState: GettingStartedReducerState = {
  poll: false,
  gettingStartedState: new GettingStartedState({
    onboardingStatusId: '',
    selectedExample: null,
    skipped: true,
    step: 'STEP6_CLOSED',
  }),
}

export function reduceGettingStartedState(state: GettingStartedReducerState = initialState, action: ReduxAction): GettingStartedReducerState { // tslint:disable-line
  switch (action.type) {
    case Constants.UPDATE:
      const gettingStartedState: GettingStartedState = action.payload.gettingStartedState
      if (!gettingStartedState.selectedExample) {
        gettingStartedState.selectedExample = state.gettingStartedState.selectedExample
      }
      // TODO: use reselect for derived data
      return Object.assign({}, state, {
        gettingStartedState,
        poll: gettingStartedState.isCurrentStep('STEP5_WAITING'),
      })
    default:
      return state
  }
}
