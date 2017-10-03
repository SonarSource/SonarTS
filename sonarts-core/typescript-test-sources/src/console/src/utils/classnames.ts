import * as classnames from 'classnames'
const hasOwn = {}.hasOwnProperty

declare type ClassValue = string | number | ClassDictionary | ClassArray

interface ClassDictionary {
  [id: string]: boolean
}

interface ClassArray extends Array<ClassValue> { }

interface ClassNamesFn {
  (...classes: ClassValue[]): string
}

export {
  classnames
}
