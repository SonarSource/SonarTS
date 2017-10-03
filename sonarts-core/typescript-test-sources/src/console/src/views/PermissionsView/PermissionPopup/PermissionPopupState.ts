import {isEqual} from 'lodash'
import {PermissionPopupState} from './PermissionPopup'
import {ModelPermission} from '../../../types/types'
export interface PermissionPopupErrors {
  permissionTypeMissing: boolean
  invalidQuery: boolean
  noFieldsSelected: boolean
}

export function isValid(state: PermissionPopupState): PermissionPopupErrors {
  let errors: PermissionPopupErrors = {
    permissionTypeMissing: false,
    invalidQuery: false,
    noFieldsSelected: false,
  }

  errors.permissionTypeMissing = state.selectedOperation === null
  errors.invalidQuery = !state.queryValid
  errors.noFieldsSelected = state.editing ? false :
    (state.selectedOperation === 'READ' && (state.fieldIds.length === 0 && !state.applyToWholeModel))

  return errors
}

export function errorInTab(errors: PermissionPopupErrors, editing: boolean, index: number) {
  const {permissionTypeMissing, invalidQuery, noFieldsSelected} = errors

  if (editing) {
    if (index === 0) {
      return noFieldsSelected
    }

    if (index === 1) {
      return invalidQuery
    }

  } else {
    if (index === 0) {
      return permissionTypeMissing
    }

    if (index === 1) {
      return noFieldsSelected
    }

    if (index === 2) {
      return invalidQuery
    }
  }

  return false
}

export function didChange(state: PermissionPopupState, permission?: ModelPermission) {
  if (!permission) {
    return false
  }
  return state.selectedOperation !== permission.operation ||
      !isEqual(state.fieldIds.sort(), permission.fieldIds.sort()) ||
      state.applyToWholeModel !== permission.applyToWholeModel ||
      state.rule !== permission.rule ||
      state.queryChanged ||
      state.userType !== permission.userType
}
