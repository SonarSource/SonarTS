import {isValid, toggleIsList, getMigrationUI} from '../FieldPopupState'
import {emptyField} from '../constants'

test('should invalidate empty field', () => {
  const valid = isValid(0, emptyField(), undefined)
  expect(valid.enumValueMissing).toBe(false)
  expect(valid.invalidName).toBe(true)
  expect(valid.migrationValueMissing).toBe(false)
  expect(valid.typeMissing).toBe(true)
})

test('should toggle isList', () => {
  expect(toggleIsList(emptyField()).isList).toBe(true)
})

describe('show proper migration ui state', () => {
  test('do not show migration when there are no nodes', () => {
    const migrationUI = getMigrationUI(
      0,
      {
        ...emptyField(),
        isRequired: true,
      },
      emptyField(),
    )
    expect(migrationUI.showMigration).toBe(false)
    expect(migrationUI.migrationOptional).toBe(true)
  })
  test('show migration and make it mandatory when there are nodes and the new field is required', () => {
    const migrationUI = getMigrationUI(
      5,
      {
        ...emptyField(),
        isRequired: true,
      },
      undefined,
    )
    expect(migrationUI.showMigration).toBe(true)
    expect(migrationUI.migrationOptional).toBe(false)
  })
  test('show migration and make it mandatory when field changed to required', () => {
    const migrationUI = getMigrationUI(
      5,
      {
        ...emptyField(),
        isRequired: true,
      },
      emptyField(),
    )
    expect(migrationUI.showMigration).toBe(true)
    expect(migrationUI.migrationOptional).toBe(false)
  })
  test('show migration and make it mandatory when type changed', () => {
    const migrationUI = getMigrationUI(
      5,
      {
        ...emptyField(),
        typeIdentifier: 'String',
      },
      emptyField(),
    )
    expect(migrationUI.showMigration).toBe(true)
    expect(migrationUI.migrationOptional).toBe(false)
  })
  test('show migration and make it mandatory when it got list from scalar', () => {
    const migrationUI = getMigrationUI(
      5,
      {
        ...emptyField(),
        isList: true,
      },
      emptyField(),
    )
    expect(migrationUI.showMigration).toBe(true)
    expect(migrationUI.migrationOptional).toBe(false)
  })
  test('show migration and make it mandatory when it got scalar from list', () => {
    const migrationUI = getMigrationUI(
      5,
      emptyField(),
      {
        ...emptyField(),
        isList: true,
      },
    )
    expect(migrationUI.showMigration).toBe(true)
    expect(migrationUI.migrationOptional).toBe(false)
  })
})
