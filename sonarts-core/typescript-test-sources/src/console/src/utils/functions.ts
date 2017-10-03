import {EventType} from '../views/FunctionsView/FunctionPopup/FunctionPopup'
import {ServerlessFunction} from '../types/types'
export function getEventTypeFromFunction(fn: ServerlessFunction | null): EventType {
  if (!fn) {
    return null
  }

  if (fn.hasOwnProperty('binding')) {
    return 'RP'
  }

  if (fn.hasOwnProperty('query')) {
    return 'SSS'
  }

  return 'RP'
}
