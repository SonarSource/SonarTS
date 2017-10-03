import * as React from 'react'
import {CellProps, CellState} from './cells'
import {stringToValue, valueToString} from '../../../../utils/valueparser'

export default class IntCell extends React.Component<CellProps<number>, CellState> {

  constructor(props) {
    super(props)

    this.state = {
      valueString: valueToString(this.props.value, this.props.field, false),
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      const valueString = valueToString(nextProps.value, this.props.field, false)
      this.setState({valueString})
    }
  }

  render() {
    // onBlur={(e: any) => this.props.save(stringToValue(e.target.value, this.props.field))}
    return (
      <input
        autoFocus
        type='text'
        ref='input'
        value={this.state.valueString}
        onKeyDown={this.props.onKeyDown}
        onChange={this.handleChange}
        placeholder='Enter an Integer...'
      />
    )
  }

  private handleChange = (e: any) => {
    if (e.target.value === '') {
      this.setState({
        valueString: e.target.value,
      })
      return
    }

    const regex = /^-?\d*$/
    if (regex.test(e.target.value)) {
      this.setState({
        valueString: e.target.value,
      })
    }
  }
}
