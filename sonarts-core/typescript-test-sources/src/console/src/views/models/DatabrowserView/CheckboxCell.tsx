import * as React from 'react'
const classes: any = require('./CheckboxCell.scss')
import {classnames} from '../../../utils/classnames'

interface Props {
  onChange: (checked: boolean) => void
  checked: boolean
  height: number
  disabled?: boolean
}

export default class CheckboxCell extends React.Component<Props, {}> {

  _toggle () {
    this.props.onChange(!this.props.checked)
  }

  render () {
    return (
      <div
        className={classes.root}
        style={{
          height: this.props.height,
        }}
        onClick={() => this._toggle()}
      >
        <div
          className={classes.border}
        >

          <div
            className={
              classnames(classes.dot, {
                [classes.active]: this.props.checked,
              })
            }
          >

          </div>
        </div>
      </div>
    )
  }
}
/*backgroundColor: this.props.checked ? '#EEF9FF' : this.props.backgroundColor,*/
