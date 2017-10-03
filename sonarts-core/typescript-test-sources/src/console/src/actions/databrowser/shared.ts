import {ReduxAction} from '../../types/reducers'
import Constants from '../../constants/databrowser/shared'

export function resetDataAndUI(): ReduxAction {
  return {
    type: Constants.RESET,
  }
}
