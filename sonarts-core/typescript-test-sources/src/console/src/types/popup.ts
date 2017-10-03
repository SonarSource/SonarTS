import * as Immutable from 'immutable'

export interface Popup {
  element: JSX.Element
  id: string
  blurBackground?: boolean
}

export interface PopupState {
  popups: Immutable.List<Popup>
}
