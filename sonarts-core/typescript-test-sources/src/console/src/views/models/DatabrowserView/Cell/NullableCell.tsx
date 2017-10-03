import * as React from 'react'
import {classnames} from '../../../../utils/classnames'

const classes = require('./NullableCell.scss')

interface Props {
  save: (value: any) => void
  cell: React.ReactElement<any>
}

interface State {
  isOverNullButton: boolean
}

export default class NullableCell extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      isOverNullButton: false,
    }
  }

  render() {
    return (
      <div className={classes.root}>
        {this.getSubCell()}
        <div
          className={classnames(classes.button, classes.blue)}
          onMouseEnter={() => this.setState({isOverNullButton: true})}
          onMouseLeave={() => this.setState({isOverNullButton: false})}
          onClick={() => this.props.save(null)}
        >
          <div>
          null
          </div>
        </div>
      </div>
    )
  }

  private getSubCell = (): JSX.Element => {
    if (!this.state.isOverNullButton) {
      return this.props.cell
    }

    const props = Object.assign(
      {},
      this.props.cell.props,
      {
        save: () => null,
        cancel: () => null,
      },
    )
    return React.cloneElement(this.props.cell, props)
  }
}
