import * as React from 'react'
import {ESCAPE_KEY, ENTER_KEY} from '../../../utils/constants'

interface Props {
  className?: string
  style?: any
  cpc: string
  didChangeCPC: Function
  setEditingState?: Function
  onKeyDown?: Function
  close?: Function
}

export default class CreditCardBack extends React.Component<Props, {}> {

  render() {

    const handleKeyDown = this.props.onKeyDown || this.handleKeyDown

    return (
      <div className={`container ${this.props.className || ''}`} style={this.props.style}>
        <style jsx={true}>{`

          .container {
            @p: .flex, .flexColumn;
            background-color: rgba(29,96,164,1);
            border-radius: 5px;
            height: 220px;
            width: 350px;
          }

          .inputField {
            @p: .ph10, .pv6, .f16, .tc, .br2, .ml10, .mr38;
            width: 46px;
            height: 35px;
          }

          .top {
            @p: .bgBlack, .mv38;
            height: 50px;
          }

        `}</style>
        <div className='top' />
        <div className='flex justifyEnd itemsCenter'>
          <div className='f12 fw6 white30 ttu'>CPC</div>
          <input
            className='inputField'
            placeholder='XXX'
            type='text'
            value={this.props.cpc}
            onChange={(e: any) => this.props.didChangeCPC(e.target.value)}
            tabIndex={3}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
      </div>
    )
  }

  private handleKeyDown = (e) => {
    if (e.keyCode === ENTER_KEY) {
      // this.props.setEditingState(false, true)
    } else if (e.keyCode === ESCAPE_KEY) {
      // this.props.setEditingState(false, false)
    }
  }
}
