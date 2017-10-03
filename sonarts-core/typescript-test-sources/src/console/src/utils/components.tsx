import * as React from 'react' // tslint:disable-line
import {pick} from 'lodash'

export function ExcludeProps(SubComponent: any, filter: string[] = []) {
  return (props) => {
    const keys = Object.keys(props).filter(key => !filter.includes(key))
    const picked = pick(props, keys)

    return <SubComponent {...picked} />
  }
}
