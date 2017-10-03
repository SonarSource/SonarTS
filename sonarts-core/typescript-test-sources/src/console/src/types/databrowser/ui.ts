import * as Immutable from 'immutable'
import {ActionRowState} from './actionrow'

export interface DataBrowserUIState {
  searchVisible: boolean
  newRowActive: boolean
  selectedNodeIds: Immutable.List<string>
  scrollTop: number
  loading: boolean
  actionRow: ActionRowState
  selectedCell: GridPosition
  editing: boolean
  writing: boolean
  searchQuery: string
}

export interface GridPosition {
  row: number
  field: string
}
