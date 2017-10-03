import {DataBrowserDataState} from './data'
import {DataBrowserUIState} from './ui'

export interface DataBrowserState {
  data: DataBrowserDataState
  ui: DataBrowserUIState
}
