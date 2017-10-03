import {Field} from '../types/types'
export function isScalar (typeIdentifier: string): boolean {
  return typeIdentifier !== 'Relation'
}

export function isNonScalarList(field: Field) {
  const {typeIdentifier, isList} = field
  return !isScalar(typeIdentifier) && isList
}
