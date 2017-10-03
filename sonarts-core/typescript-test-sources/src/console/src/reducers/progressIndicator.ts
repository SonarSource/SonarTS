import {ReduxAction} from '../types/reducers'
import Constants from '../constants/progressIndicator'
import {ProgressIndicatorState} from '../types/progressIndicator'

const initialState: ProgressIndicatorState = {
  progress: 0,
}

export function reduceProgress (state: ProgressIndicatorState = initialState, action: ReduxAction): ProgressIndicatorState { // tslint:disable-line
  switch (action.type) {
    case Constants.START_PROGRESS:
      return Object.assign({}, initialState)
    case Constants.INCREMENT_PROGRESS:
      return Object.assign({}, {
        progress: state.progress + 1,
      })
    default:
      return state
  }
}
