import * as React from 'react' // tslint:disable-line
import {$p} from 'graphcool-styles'
import * as cx from 'classnames'
import {range} from 'lodash'

function renderCode(code: string) {
  let openCount = 0
  let lines = code
    .split(/\r\n|\r|\n/)

  return lines.map((line, index) => {
    if (line.includes('}')) {
      openCount--
    }

    const spaces = getNSpaces(openCount * 2)

    if (line.includes('{')) {
      openCount++
    }

    return `<div>${spaces}${line.trim()}</div>`
  })
    .join('\n')
    .replace(/(\{|\})/g, (a, b) => `<span class="${$p.white30}">${b}</span>`)
}

function getNSpaces(n) {
  return range(n).map(() => '&nbsp;').join('')
}

export default ({code}) => (
  <div
    className={cx($p.code, $p.white)}
    dangerouslySetInnerHTML={{__html: renderCode(code)}}
  ></div>
)
