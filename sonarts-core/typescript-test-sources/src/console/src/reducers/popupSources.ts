import {ReduxAction} from '../types/reducers'
import Constants from '../constants/popupSources'
import {PopupSourcesState} from '../types/popupSources'

const initialState: PopupSourcesState = {
  relationsPopup: 'schema',
  fieldPopup: 'schema',
}

export default function reduce(state: PopupSourcesState = initialState, action: ReduxAction): PopupSourcesState {
  switch (action.type) {
    case Constants.SET_FIELD_POPUP_SOURCE:
      return Object.assign({}, state, {
        fieldPopup: action.payload,
      })
    case Constants.SET_RELATIONS_POPUP_SOURCE:
      return Object.assign({}, state, {
        relationsPopup: action.payload,
      })
    default:
      return state
  }
}
