import {isValidDateTime, isValidEnum} from './utils'
import {Field, Operation} from '../types/types'
import {isScalar} from './graphql'
import {TypedValue, NonScalarValue, ScalarValue, AtomicValue} from '../types/utils'

export function valueToString(
  value: TypedValue,
  field: Field,
  returnNullAsString: boolean,
  serialize: boolean = false,
): string {
  if (value === null) {
    return returnNullAsString ? 'null' : ''
  }

  if (field.isList) {

    if (!isValidList(value)) {
      return returnNullAsString ? 'null' : ''
    }

    const valueArray: Array<AtomicValue> = value as Array<AtomicValue>

    if (listIsEmpty(value as (ScalarValue[] | NonScalarValue[]))) {
      return '[]'
    }

    if (!isStringlyType(field, serialize)) {
      return `[${valueArray.map((val) =>
        `${atomicValueToString(val, field, returnNullAsString, serialize)}`,
      ).join(', ')}]`
    } else {
      return `[${valueArray.map((val) =>
        `"${atomicValueToString(val, field, returnNullAsString, serialize)}"`,
      ).join(', ')}]`
    }

  } else {
    return atomicValueToString(value as AtomicValue, field, returnNullAsString, serialize)
  }
}

function isStringlyType(field: Field, serialize: boolean = false): boolean {
  const type = field.typeIdentifier

  if (serialize) {
    switch (type) {
      case 'Boolean':
      case 'Int':
      case 'Enum':
      case 'Json':
      case 'Float':
        return false
      default:
        return true
    }
  } else {
    switch (type) {
      case 'Enum':
      case 'Boolean':
      case 'Int':
      case 'Json':
      case 'Float':
        return false
      default:
        return true
    }
  }
}

function isValidList(value: any): boolean {
  // TODO improve this code because it doesn't check if the items are of the same type
  return value instanceof Array
}

function listIsEmpty(value: (Array<AtomicValue>)): boolean {
  return value.length === 0
}

export function atomicValueToString(
  value: AtomicValue,
  field: Field,
  returnNullAsString: boolean = true,
  serialize: boolean = false,
): string {
  if (value === null) {
    return returnNullAsString ? 'null' : ''
  }

  const type = field.typeIdentifier
  if (!isScalar(type)) {
    const nonScalarValue = value as NonScalarValue
    if (nonScalarValue && nonScalarValue.hasOwnProperty('id')) {
      return nonScalarValue.id
    }
    return null
  }

  switch (type) {
    case 'DateTime':
      if (serialize) {
        return new Date(value).toISOString()
      }
      return new Date(value).toLocaleString()
    case 'Password':
      return '***************'
    case 'Json':
      if (typeof value === 'string') {
        return value
      }
      return JSON.stringify(value)
    default:
      if (value === undefined) {
        return ''
      }
      return value.toString()
  }
}

export function stringToValue(rawValue: string, field: Field, forceScalar: boolean = false): TypedValue {
  if (rawValue === null) {
    return null
  }
  const {isList, isRequired, typeIdentifier} = field
  if (rawValue === '' && !isRequired) {
    return typeIdentifier === 'String' ? '' : null
  }

  if (!isScalar(typeIdentifier) && !forceScalar) {
    if (isList) {
      try {
        let json = JSON.parse(rawValue)
        if (!(json instanceof Array)) {
          throw 'value is not an array'
        }
        for (let i = 0; i < json.length; i++) {
          if (!json[i].hasOwnProperty('id')) {
            throw 'value does not have "id" field'
          }
        }
        return json
      } catch (e) {
        return null // TODO add true error handling
      }
    }
    return {id: rawValue}
  }

  if (isList && !forceScalar) {
    if (typeIdentifier === 'Enum') {
      return rawValue.slice(1, -1).split(',').map((value) => value.trim())
    }
    try {
      return JSON.parse(rawValue)
    } catch (e) {
      return null
    }
  } else {
    return {
      String: () => rawValue,
      Boolean: () => rawValue.toLowerCase() === 'true' ? true : rawValue.toLowerCase() === 'false' ? false : null,
      Int: () => isNaN(parseInt(rawValue, 10)) ? null : parseInt(rawValue, 10),
      Float: () => isNaN(parseFloat(rawValue)) ? null : parseFloat(rawValue),
      GraphQLID: () => rawValue,
      Password: () => rawValue,
      Enum: () => isValidEnum(rawValue) ? rawValue : null,
      DateTime: () => isValidDateTime(rawValue) ? rawValue : null,
      Json: () => isJSON(rawValue) ? rawValue : null,
    }[typeIdentifier]()
  }
}

export function getFieldTypeName(field: Field) {
  if (isScalar(field.typeIdentifier)) {
    return field.typeIdentifier
  } else {
    return field.relatedModel.name
  }
}

export function isJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString)
  } catch (e) {
    return false
  }
  return true
}

export function validPermissionField(operation: Operation, field: Field) {
  if (['CREATE', 'UPDATE'].includes(operation) && field.isReadonly) {
    return false
  }
  if (isScalar(field.typeIdentifier)) {
    return true
  }
  return false
}
