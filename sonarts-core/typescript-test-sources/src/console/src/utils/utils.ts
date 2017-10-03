import * as moment from 'moment'
import {ISO8601} from './constants'
import {Field} from '../types/types'

export function randomString(length: number): string {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

export function isValidUrl(str: string): boolean {
  const pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  return pattern.test(str)
}

export function isValidMutationCallbackUrl(str: string): boolean {
  const blackList = [
    '127.0.0.1',
    '0.0.0.0',
    'localhost',
  ]
  const withoutProtocol = str.replace(/http(s)?:\/\//, '')
  return !blackList.includes(withoutProtocol) && (isValidUrl(str) || isValidIp(withoutProtocol))
}

export function isValidIp(str: string): boolean {
  const i = str.indexOf('/')
  const withoutSlash = str.slice(0, i)
  const pattern = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/
  return pattern.test(withoutSlash)
}

export function isValidDateTime(dateTime: string): boolean {
  // returns whether the string conforms to ISO8601
  // the strict format is '2016-05-19T17:09:24.123Z' but we also accept simpler versions like '2016'
  return moment.utc(dateTime, ISO8601).isValid()
}

export function isValidEnum(value: string): boolean {
  return /^[_a-zA-Z][_a-zA-Z0-9]*$/.test(value)
}

export function debounce(func, wait) {
  let timeout
  return (...args) => {
    const context = this
    const later = () => {
      timeout = null
      func.apply(context, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

interface RetryUntilDoneOptions {
  maxRetries?: number
  timeout?: number
}

export function retryUntilDone(fn: (done: () => void) => void, options: RetryUntilDoneOptions = {}): void {
  const maxRetries = options.maxRetries || 100
  const timeout = options.timeout || 100

  let tries = 0
  let shouldBreak = false

  let interval = setInterval(
    () => {
      tries++

        fn(() => {
        clearInterval(interval)
      })

      if (tries < maxRetries) {
        clearInterval(interval)
      }
    },
    timeout,
  )

}

export function lowercaseFirstLetter(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

export function uppercaseFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function removeDuplicatesFromStringArray(arr: string[]): string[] {
  let s = new Set(arr)
  let it = s.values()
  return Array.from(it)
}

// http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function numberWithCommasRounded(x, digits) {
  return x.toFixed(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function chunk(str: string, n: number, includeRemainder: boolean): string[] {
  let result: string[] = []
  while (n < str.length) {
    let chunk = str.substring(0, n)
    result.push(chunk)
    str = str.substring(n, str.length)
  }
  if (includeRemainder) {
    result.push(str)
  }
  return result
}

// month is 1 based
export function daysInMonth(month,year) {
  return new Date(year, month, 0).getDate()
}

// input: timestamp with format: "2017-01-31T23:00:00.000Z"
export function mmDDyyyyFromTimestamp(timestamp: string): string {
  const components = timestamp.split('T')
  const dateString = components[0]
  let dateComponents = dateString.split('-')
  const yyyy = dateComponents.shift()
  dateComponents.push(yyyy)
  return dateComponents.join('/')
}

export function todayString(): string {
  const today = new Date()
  const dd = today.getDate()
  const mm = today.getMonth() + 1
  const yyyy = today.getFullYear()
  const todayString = mm + '/' + dd + '/' + yyyy
  return todayString
}

export const idToBeginning = (a: Field, b: Field) => {
  if (a.name === 'id') {
    return -1
  }
  if (b.name === 'id') {
    return 1
  }

  if (a.name === 'description' && b.name === 'imageUrl') {
    return 1
  }

  if (a.name === 'imageUrl' && b.name === 'description') {
    return -1
  }

  return a.name > b.name ? 1 : -1
}
