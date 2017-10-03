import * as React from 'react'
import { CellProps } from './cells'
import { stringToValue } from '../../../../utils/valueparser'

export default class DefaultCell extends React.Component<CellProps<string>, {}> {
  render() {
    return (
      <input
        autoFocus
        type='text'
        ref='input'
        defaultValue={this.props.value || ''}
        onKeyDown={this.props.onKeyDown}
        onBlur={(e: any) => this.props.save(stringToValue(e.target.value, this.props.field))}
      />
    )
  }
}
