import Constants from '../../constants/databrowser/ui'
import * as Immutable from 'immutable'
import {ReduxAction, ReduxThunk} from '../../types/reducers'
import {Field} from '../../types/types'
import {nextStep} from '../gettingStarted'
import {GridPosition} from '../../types/databrowser/ui'
import { setNewRowShown } from './data'
import {SYSTEM_MODELS_PLURAL} from '../../constants/system'
import tracker from '../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'

export function hideNewRow(): ReduxAction {
  return {
    type: Constants.HIDE_NEW_ROW,
  }
}

export function forceShowNewRow() {
  return {
    type: Constants.FORCE_SHOW_NEW_ROW,
  }
}

export function toggleNewRow(fields: Field[], modelNamePlural: string): ReduxThunk {
  return (dispatch, getState) => {
    if (SYSTEM_MODELS_PLURAL.includes(modelNamePlural)) {
      return
    }
    const { newRowActive } = getState().databrowser.ui
    const { newRowShown } = getState().databrowser.data
    const { step } = getState().gettingStarted.gettingStartedState

    if (!newRowShown) {
      dispatch(setNewRowShown())
    }

    // if we're activating the new row, also select the first field
    if (!newRowActive && fields) {
      const firstNonReadonlyField = getFirstNonReadonlyField(fields)
      dispatch(selectCell({
        row: -1,
        field: firstNonReadonlyField.name,
      }))
    }

    dispatch({
      type: Constants.TOGGLE_NEW_ROW,
    })
  }
}

function getFirstNonReadonlyField(fields: Field[]): Field {
  for (let i = 0; i < fields.length; i++) {
    if (!fields[i].isReadonly) {
      return fields[i]
    }
  }

  return fields[0]
}

export function setNodeSelection(ids: Immutable.List<string>): ReduxAction {
  return {
    type: Constants.SET_NODE_SELECTION,
    payload: ids,
  }
}

export function clearNodeSelection(): ReduxAction {
  return {
    type: Constants.CLEAR_NODE_SELECTION,
  }
}

export function toggleNodeSelection(id: string): ReduxAction {
  tracker.track(ConsoleEvents.Databrowser.rowSelected())
  return {
    type: Constants.TOGGLE_NODE_SELECTION,
    payload: id,
  }
}

export function setScrollTop(scrollTop: number): ReduxAction {
  return {
    type: Constants.SET_SCROLL_TOP,
    payload: scrollTop,
  }
}

export function setLoading(loading: boolean): ReduxAction {
  return {
    type: Constants.SET_LOADING,
    payload: loading,
  }
}

export function toggleSearch(): ReduxAction {
  return {
    type: Constants.TOGGLE_SEARCH,
  }
}

export function selectCell(position: GridPosition): ReduxAction {
  return {
    type: Constants.SELECT_CELL,
    payload: position,
  }
}

export function unselectCell(): ReduxAction {
  return {
    type: Constants.UNSELECT_CELL,
  }
}

export function editCell(position: GridPosition): ReduxAction {
  tracker.track(ConsoleEvents.Databrowser.Cell.edited())
  return {
    type: Constants.EDIT_CELL,
    payload: position,
  }
}

export function stopEditCell(): ReduxThunk {
  return (dispatch, getState) => {
    dispatch({
      type: Constants.STOP_EDIT_CELL,
    })
  }
}

export function setDataBrowserViewRef(ref: HTMLElement) {
  return {
    type: Constants.SET_DATA_BROWSER_VIEW_REF,
    payload: ref,
  }
}

export function setBrowserViewRef(ref: any): ReduxAction {
  return {
    type: Constants.SET_BROWSER_VIEW_REF,
    payload: ref,
  }
}

export function nextCell(fields: Field[]): ReduxThunk {
  return (dispatch, getState) => {
    if (!fields) {
      return
    }
    const { selectedCell, newRowActive } = getState().databrowser.ui
    const { nodes } = getState().databrowser.data

    const i = fields.map(f => f.name).indexOf(selectedCell.field)

    if (i === fields.length - 1) {
      // last in the row, so go to first of next row
      dispatch(selectCell({
        row: (selectedCell.row + (newRowActive ? 0 : 1)) % nodes.size,
        field: fields[0].name,
      }))
    } else {
      dispatch(selectCell({
        row: selectedCell.row,
        field: fields[i + 1].name,
      }))
    }
  }
}

export function previousCell(fields: Field[]): ReduxThunk {
  return (dispatch, getState) => {
    if (!fields) {
      return
    }
    const { selectedCell, newRowActive } = getState().databrowser.ui
    const { nodes } = getState().databrowser.data

    const i = fields.map(f => f.name).indexOf(selectedCell.field)

    if (i === 0) {
      // last in the row, so go to last of prev row
      dispatch(selectCell({
        row: (selectedCell.row + (newRowActive ? 0 : (nodes.size - 1))) % nodes.size,
        field: fields[fields.length - 1].name,
      }))
    } else {
      dispatch(selectCell({
        row: selectedCell.row,
        field: fields[i - 1].name,
      }))
    }
  }
}

export function nextRow(fields: Field[], modelNamePlural: string): ReduxThunk {
  return (dispatch, getState) => {
    if (!fields) {
      return
    }
    const { selectedCell, newRowActive } = getState().databrowser.ui
    const { nodes } = getState().databrowser.data

    const rowIndex: number = selectedCell.row === nodes.size - 1 ? selectedCell.row : selectedCell.row + 1

    if (rowIndex === -1 && !newRowActive) {
      dispatch(toggleNewRow(fields, modelNamePlural))
    }

    dispatch(selectCell({
      row: rowIndex,
      field: selectedCell.field,
    }))
  }
}

export function previousRow(fields: Field[], modelNamePlural: string): ReduxThunk {
  return (dispatch, getState) => {
    if (!fields) {
      return
    }
    const { selectedCell, newRowActive } = getState().databrowser.ui
    const { nodes } = getState().databrowser.data

    const rowIndex = selectedCell.row === -1 ? -1 : (((selectedCell.row - 1 + 1 + nodes.size) % nodes.size) - 1)

    if (rowIndex === -1 && !newRowActive) {
      dispatch(toggleNewRow(fields, modelNamePlural))
    }

    dispatch(selectCell({
      row: rowIndex,
      field: selectedCell.field,
    }))
  }
}
