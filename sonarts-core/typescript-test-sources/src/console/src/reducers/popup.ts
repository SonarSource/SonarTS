import {ReduxAction} from '../types/reducers'
import Constants from '../constants/popup'
import {Popup, PopupState} from '../types/popup'
import * as Immutable from 'immutable'

const initialState: PopupState = {
  popups: Immutable.List<Popup>(),
}

export function reducePopup(state: PopupState = initialState, action: ReduxAction): PopupState {
  switch (action.type) {
    case Constants.SHOW_POPUP:
      return {
        popups: state.popups.push(action.payload),
      }
    case Constants.CLOSE_POPUP:
      if (!action.payload) {
        return {
          popups: state.popups.pop(),
        }
      }
      return {
        popups: state.popups.filter(value => value.id !== action.payload).toList(),
      }
    default:
      return state
  }
}
