import { ReduxAction } from '../types/reducers'
import Constants from '../constants/progressIndicator'

export function startProgress(): ReduxAction {
  return {
    type: Constants.START_PROGRESS,
  }
}

export function incrementProgress(): ReduxAction {
  return {
    type: Constants.INCREMENT_PROGRESS,
  }
}
