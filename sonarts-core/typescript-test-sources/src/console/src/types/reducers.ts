import {GettingStartedReducerState} from '../types/gettingStarted'
import {PopupState} from '../types/popup'
import {ProgressIndicatorState} from '../types/progressIndicator'
import {NotificationState} from '../types/notification'
import {DataBrowserState} from '../types/databrowser/shared'
import * as Bluebird from 'bluebird'
import {PopupSourcesState} from './popupSources'

export interface ReduxAction {
  type: string,
  payload?: any,
}

export type Dispatch = (action: ReduxAction | ReduxThunk) => any

export type ReduxThunk = (dispatch: Dispatch, getState: () => StateTree) => Promise<{}> | Bluebird<void> | void

export interface StateTree {
  gettingStarted: GettingStartedReducerState
  popup: PopupState
  progressIndicator: ProgressIndicatorState
  notification: NotificationState
  databrowser: DataBrowserState
  popupSources: PopupSourcesState
}
