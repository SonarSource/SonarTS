import * as React from 'react'
const classes: any = require('./LoadingCell.scss')

interface Props {
  empty?: boolean
  left?: number
  backgroundColor?: string
}

export default class LoadingCell extends React.Component<Props, {}> {
  render() {
    return (
      <div
        className={classes.root}
        style={{
          marginLeft: 0 + this.props.left || 0,
          backgroundColor: this.props.backgroundColor || 'transparent',
        }}
      >
        <span className={classes.content}>
          {!this.props.empty &&
          <div
            className={classes.loader}
            style={{
              width: `${100 - (50 * Math.random())}%`,
            }}
          />
          }
        </span>
      </div>
    )
  }
}
