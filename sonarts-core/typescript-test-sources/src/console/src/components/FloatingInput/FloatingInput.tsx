import * as React from 'react'
import {randomString} from '../../utils/utils'

const classes: any = require('./FloatingInput.scss')

interface Props {
  label: string
  labelClassName?: string
  [key: string]: any
}

interface State {
  id: string
}

export default class FloatingLabel extends React.Component<Props, State> {

  state = {
    id: randomString(5),
  }

  render() {
    const restProps = Object.assign({}, this.props)
    delete restProps.labelClassName

    return (
      <div className={classes.root}>
        <input
          id={this.state.id}
          {...restProps}
        />
        <label
          htmlFor={this.state.id}
          className={this.props.labelClassName}
        >
          {this.props.label}
        </label>
      </div>
    )
  }
}
