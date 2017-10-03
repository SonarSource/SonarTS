import * as React from 'react'
import {Icon, $v} from 'graphcool-styles'
import ClickOutside from 'react-click-outside'

interface Props {
  children?: any
}

interface State {
  open: boolean
}

export default class TypeBoxSettings extends React.Component<Props, State> {

  ref: HTMLDivElement
  canClose: boolean

  constructor(props) {
    super(props)

    this.state = {
      open: false,
    }
  }

  render() {
    const {open} = this.state
    return (
      open ? (
        <ClickOutside onClickOutside={this.close}>
          <div className='popup'>
            <style jsx>{`
              .popup {
                @p: .bgWhite, .br2, .absolute, .nowrap, .pointer;
                box-shadow: 0 1px 7px $gray20;
                transform: translate(calc(-100% - 16px), -50%);
              }
              .row + .row {
                @p: .bt, .bBlack10;
              }
              .row:hover {
                @p: .bgBlack04;
              }
            `}</style>
            {React.Children.map(this.props.children, child => (
              <div className='row' onClick={this.close}>{child}</div>
            ))}
          </div>
        </ClickOutside>
      ) : (
        <div className='dots' ref={ref => this.ref = ref} onClick={this.open}>
          <style jsx>{`
            .dots {
              @p: .pr25, .pointer;
            }
            .dots:hover :global(svg) {
              fill: $gray50;
            }
          `}</style>
          <Icon
            src={require('assets/icons/vdots.svg')}
            color={$v.gray30}
            width={4}
            height={19}
          />
        </div>
      )
    )
  }

  private open = (e) => {
    e.stopPropagation()
    this.setState({open: true})
  }

  private close = (e) => {
    e.stopPropagation()
    this.setState({open: false})
  }
}
