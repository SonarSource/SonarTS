import {ReduxAction} from '../types/reducers'
import {Popup} from '../types/popup'
import Constants from '../constants/popup'

export function showPopup(popup: Popup): ReduxAction {
  return {
    type: Constants.SHOW_POPUP,
    payload: popup,
  }
}

export function closePopup(id?: string): ReduxAction {
  return {
    type: Constants.CLOSE_POPUP,
    payload: id,
  }
}
