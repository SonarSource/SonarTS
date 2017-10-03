import {FieldType, Field, Constraint, ConstraintType} from '../../../types/types'
import {MigrationUIState} from './FieldPopup'
import {TypedValue} from '../../../types/utils'

// Validation

export interface FieldPopupErrors {
  typeMissing: boolean
  invalidName: boolean
  migrationValueMissing: boolean
  enumValueMissing: boolean
}

export function errorInTab(errors: FieldPopupErrors, index: number) {
  const {typeMissing, invalidName, migrationValueMissing, enumValueMissing} = errors

  if (index === 0) {
    return typeMissing || invalidName || enumValueMissing
  }

  if (index === 1) {
    return migrationValueMissing
  }

  return false
}

export function isValid(nodeCount: number, mutatedField: Field, initialField?: Field): FieldPopupErrors {
  let errors: FieldPopupErrors = {
    typeMissing: false,
    invalidName: false,
    migrationValueMissing: false,
    enumValueMissing: false,
  }

  errors.typeMissing = !mutatedField.typeIdentifier || (mutatedField.typeIdentifier as string === '')

  errors.invalidName = !validateFieldName(mutatedField.name)

  const migrationUI = getMigrationUI(nodeCount, mutatedField, initialField)
  errors.migrationValueMissing = (!migrationUI.migrationOptional && migrationUI.showMigration)
    && (typeof mutatedField.migrationValue === 'undefined')

  // errors.enumValueMissing = mutatedField.typeIdentifier === 'Enum' && mutatedField.enumValues.length === 0
  errors.enumValueMissing = false

  return errors
}

export function isBreaking(nodeCount: number, mutatedField: Field, initialField?: Field): boolean {
  if (nodeCount === 0) {
    return false
  }
  if (!initialField) {
    return false
  }

  // isRequired is not interesting here, because either we get the error from the server (not req => req)
  // or it is just not breaking
  if (
    initialField.isList !== mutatedField.isList ||
    (initialField.isUnique && !mutatedField.isUnique) ||
    valuesMissing(initialField.enumValues, mutatedField.enumValues) || // only breaking, when values are missing
    initialField.name !== mutatedField.name ||
    initialField.typeIdentifier !== mutatedField.typeIdentifier
  ) {
    return true
  }

  return false
}

// are values of a missing in b?
export function valuesMissing(a, b) {
  let missing = false
  a.forEach(item => {
    if (!b.includes(item)) {
      missing = true
    }
  })
  return missing
}

export function didChange(mutatedField: Field, initialField?: Field): boolean {
  if (!initialField) {
    return false
  }

  return !shallowEqual(mutatedField, initialField)
}

// State Transitions

export function updateTypeIdentifier(state: Field, typeIdentifier: FieldType): Field {
  return {
    ...state,
    defaultValue: null,
    migrationValue: null,
    typeIdentifier,
  }
}

export function toggleIsList(state: Field): Field {
  return {
    ...state,
    defaultValue: undefined,
    migrationValue: undefined,
    isList: !state.isList,
  }
}

export function toggleIsRequired(state: Field): Field {
  return {
    ...state,
    isRequired: !state.isRequired,
  }
}

export function toggleIsUnique(state: Field): Field {
  return {
    ...state,
    isUnique: !state.isUnique,
  }
}

export function updateName(state: Field, name: string): Field {
  return {
    ...state,
    name,
  }
}

export function updateDescription(state: Field, description: string): Field {
  return {
    ...state,
    description,
  }
}

export function updateEnumValues(state: Field, enumValues: string[]): Field {
  return {
    ...state,
    enumValues,
  }
}

export function updateEnumId(state: Field, enumId: string): Field {
  return {
    ...state,
    enumId,
  }
}

export function updateDefaultValue(state: Field, defaultValue: TypedValue): Field {
  return {
    ...state,
    defaultValue,
  }
}

export function updateMigrationValue(state: Field, migrationValue: TypedValue): Field {
  return {
    ...state,
    migrationValue,
  }
}

export function addConstraint(state: Field, type: ConstraintType): Field {
  return {
    ...state,
    constraints: state.constraints.concat({
      type,
      value: '',
    }),
  }
}

export function removeConstraint(state: Field, index: number): Field {
  const constraints  = state.constraints.slice()
  constraints.splice(index, 1)

  return {
    ...state,
    constraints,
  }
}

export function editConstraint(state: Field, index: number, value: string): Field {
  const {constraints} = state
  const constraint = constraints[index]
  return {
    ...state,
    constraints: [
      ...constraints.slice(0, index),
      {
        ...constraint,
        value,
      },
      ...constraints.slice(index + 1, constraints.length),
    ],
  }
}

export function getMigrationUI(nodeCount: number, mutatedField: Field, initialField?: Field): MigrationUIState {
  if (nodeCount === 0) {
    return {
      showMigration: false,
      migrationOptional: true,
    }
  }

  // if it's the Create Field case
  if (!initialField) {
    if (mutatedField.isRequired) {
      return {
        showMigration: true,
        migrationOptional: false,
      }
    } else {
      return {
        showMigration: true,
        migrationOptional: true,
      }
    }
  }

  if (
    (!initialField.isRequired && mutatedField.isRequired) ||
    (initialField.typeIdentifier !== mutatedField.typeIdentifier) ||
    (initialField.isList !== mutatedField.isList)
  ) {
    return {
      showMigration: true,
      migrationOptional: false,
    }
  }

  return {
    showMigration: false,
    migrationOptional: true,
  }
}

export function validateFieldName (fieldName: string): boolean {
  return /^[a-z]/.test(fieldName) && /^[a-zA-Z0-9]+$/.test(fieldName)
}

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y) {
  // SameValue algorithm
  if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return x !== 0 || 1 / x === 1 / y
  } else {
    // Step 6.a: NaN == NaN
    return x !== x && y !== y
  }
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  let keysA = Object.keys(objA)
  let keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (!global.hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }

  return true
}
