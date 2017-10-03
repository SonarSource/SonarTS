import * as React from 'react'
import { CellProps } from './cells'
import { valueToString, stringToValue } from '../../../../utils/valueparser'

export default class JsonCell extends React.Component<CellProps<string>, {}> {
  render() {
    return (
      <textarea
        autoFocus
        type='text'
        ref='input'
        defaultValue={valueToString(this.props.value, this.props.field, false)}
        onKeyDown={this.onKeyDown}
        onBlur={(e: any) => this.props.save(stringToValue(e.target.value, this.props.field))}
      />
    )
  }

  private onKeyDown = (e: any) => {
    if ([37,38,39,40].includes(e.keyCode)) {
      return
    }
    this.props.onKeyDown(e)
  }
}
