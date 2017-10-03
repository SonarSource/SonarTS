/// <reference path="../../../node_modules/@types/jest/index.d.ts"/>
import {isValidUrl} from '../utils'
import '../polyfils'

describe('isValidUrl', () => {
  it('checks if a valid url with "http://" prefix is valid', () => {
    const url: string = 'http://graph.cool'
    expect(isValidUrl(url)).toBe(true)
  })

  it('checks if a valid url with "www." prefix is a valid url', () => {
    const url: string = 'www.graph.cool'
    expect(isValidUrl(url)).toBe(true)
  })

  it('checks if a valid url with "https://" prefix is a valid url', () => {
    const url: string = 'https://graph.cool'
    expect(isValidUrl(url)).toBe(true)
  })

  it('checks if an empty string is an invalid url', () => {
    const url: string = ''
    expect(isValidUrl(url)).toBe(false)
  })

  it('checks if a null string is an invalid url', () => {
    const url: string = null
    expect(isValidUrl(url)).toBe(false)
  })

  it('checks if an two space-separated words is an invalid url', () => {
    const url: string = 'aoethu aoeuhnatso'
    expect(isValidUrl(url)).toBe(false)
  })

  it('checks if an incomplete url is an invalid url', () => {
    const url: string = 'http://aoeu'
    expect(isValidUrl(url)).toBe(false)
  })

  it('checks if a url with a underscore trailing is an invalid url', () => {
    const url: string = 'https://google.com_'
    expect(isValidUrl(url)).toBe(false)
  })
})
