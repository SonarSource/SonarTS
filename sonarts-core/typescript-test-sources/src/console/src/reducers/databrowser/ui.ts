import {ReduxAction} from '../../types/reducers'
import Constants from '../../constants/databrowser/ui'
import SharedConstants from '../../constants/databrowser/shared'
import * as Immutable from 'immutable'
import {DataBrowserUIState} from '../../types/databrowser/ui'
import {ActionRowState} from '../../types/databrowser/actionrow'

const initialState: DataBrowserUIState = {
  searchVisible: false,
  newRowActive: false,
  selectedNodeIds: Immutable.List<string>(),
  scrollTop: 0,
  loading: true,
  writing: false,
  actionRow: ActionRowState.NewNode,
  selectedCell: {
    row: -1,
    field: null,
  },
  editing: false,
  searchQuery: null,
}

export function reduceUI(state: DataBrowserUIState = initialState, action: ReduxAction): DataBrowserUIState {
  switch (action.type) {
    case Constants.HIDE_NEW_ROW:
      return Object.assign({}, state, {
        newRowActive: false,
      })
    case Constants.FORCE_SHOW_NEW_ROW:
      return Object.assign({}, state, {
        newRowActive: true,
      })
    case Constants.TOGGLE_NEW_ROW:
      return Object.assign({}, state, {
        newRowActive: !state.newRowActive,
      })
    case Constants.TOGGLE_SEARCH:
      return Object.assign({}, state, {
        searchVisible: !state.searchVisible,
      })
    case Constants.SET_NODE_SELECTION:
      return Object.assign({}, state, {
        selectedNodeIds: action.payload,
        actionRow: action.payload.size > 0 ? ActionRowState.DeleteNode : ActionRowState.NewNode,
      })
    case Constants.CLEAR_NODE_SELECTION:
      return Object.assign({}, state, {
        selectedNodeIds: Immutable.List<string>(),
        actionRow: ActionRowState.NewNode,
      })
    case Constants.SELECT_CELL:
      return Object.assign({}, state, {
        selectedCell: action.payload,
      })
    case Constants.UNSELECT_CELL:
      return Object.assign({}, state, {
        selectedCell: {
          row: -1,
          field: null,
        },
      })
    case Constants.EDIT_CELL:
      return Object.assign({}, state, {
        editing: true,
        selectedCell: action.payload,
      })
    case Constants.STOP_EDIT_CELL:
      return Object.assign({}, state, {
        editing: false,
      })
    case Constants.TOGGLE_NODE_SELECTION:
      const id = action.payload
      if (state.selectedNodeIds.includes(id)) {
        const nodes = state.selectedNodeIds.filter(x => x !== id)
        return Object.assign({}, state, {
          selectedNodeIds: nodes,
          actionRow: nodes.size > 0 ? ActionRowState.DeleteNode : ActionRowState.NewNode,
        })
      }
      return Object.assign({}, state, {
        selectedNodeIds: state.selectedNodeIds.push(id), // using Immutable.js push here
        actionRow: ActionRowState.DeleteNode,
      })
    case Constants.SET_SCROLL_TOP:
      return Object.assign({}, state, {
        scrollTop: action.payload,
      })
    case Constants.SET_LOADING:
      return Object.assign({}, state, {
        loading: action.payload,
      })
    case Constants.SET_WRITING:
      return Object.assign({}, state, {
        writing: action.payload,
      })
    case Constants.ACTIVATE_NEW_NODE_ROW:
      return Object.assign({}, state, {
        actionRow: ActionRowState.NewNode,
      })
    case Constants.ACTIVATE_SEARCH_ROW:
      return Object.assign({}, state, {
        actionRow: ActionRowState.Search,
      })
    case Constants.ACTIVATE_DELETE_NODE_ROW:
      return Object.assign({}, state, {
        actionRow: ActionRowState.DeleteNode,
      })
    case SharedConstants.RESET:
      return initialState
  }
  return state
}
