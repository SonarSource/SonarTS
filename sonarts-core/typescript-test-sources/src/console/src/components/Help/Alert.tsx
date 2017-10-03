import * as React from 'react'
import { findDOMNode } from 'react-dom'
import Tooltip from 'rc-tooltip'
import {Icon, $v} from 'graphcool-styles'
const classes: any = require('./Help.scss')

require('rc-tooltip/assets/bootstrap.css')

interface Props {
  text: string
  placement?: 'left' | 'right' | 'top' | 'bottom'
  size?: number
}

export default class Alert extends React.Component<Props, {}> {

  render() {

    const overlay = this.props.text.split('\n').map((line, index, arr) => (
      <span key={line}>{line}{index < arr.length - 1 && (<br />)}</span>
    ))

    return (
      <div>
        <Tooltip
          placement={this.props.placement || 'right'}
          overlay={<span onClick={(e) => e.stopPropagation()}>{overlay}</span>}
          getTooltipContainer={() => findDOMNode((this.refs as any).container)}
        >
          <Icon
            width={this.props.size || 20}
            height={this.props.size || 20}
            src={require('assets/new_icons/warning.svg')}
            color={$v.red}
            stroke={false}
          />
        </Tooltip>
        <div className={classes.container} ref='container' />
      </div>
    )
  }
}
