import * as React from 'react'
import TetherComponent from 'react-tether'
import {connect} from 'react-redux'
import {GettingStartedState} from '../../types/gettingStarted'
import * as cn from 'classnames'
import {TetherStep} from '../../types/types'
const classes: any = require('./Tether.scss')

interface Props {
  steps: TetherStep[]
  children: Element
  gettingStartedState: GettingStartedState
  offsetX?: number
  offsetY?: number
  width?: number
  side?: string
  horizontal?: string
  zIndex?: number
  onMouseEnter: () => any
  onMouseLeave: () => any
  onClick?: (e: any, step: TetherStep) => void

  style: any
}

class Tether extends React.Component<Props, {}> {

  static defaultProps = {
    offsetX: 0,
    offsetY: 0,
    width: 270,
    side: 'bottom',
    horizontal: 'left',
  }

  refs: {
    container: any,
  }

  componentDidMount() {
    // assure that tether is in screen
    if (this.refs.container && typeof this.refs.container.scrollIntoViewIfNeeded === 'function') {
      this.refs.container.scrollIntoViewIfNeeded()
    }
  }

  render() {
    const step = this.props.steps.find((s) => this.props.gettingStartedState.isCurrentStep(s.step))
    const bottom = this.props.side === 'bottom'
    const left = this.props.horizontal === 'left'

    let style = {
      zIndex: this.props.zIndex ? this.props.zIndex : 500,
    }

    if (this.props.style) {
      style = Object.assign({}, style, this.props.style)
    }

    return (
      <TetherComponent
        style={style}
        targetOffset={`${this.props.offsetY}px ${this.props.offsetX}px`}
        attachment={`${bottom ? 'top' : 'bottom'} ${this.props.horizontal}`}
        targetAttachment={`${bottom ? 'bottom' : 'top'} ${this.props.horizontal}`}
      >
        {this.props.children}
        {step && (
          <div
            className={cn('tether', {bottom, top: !bottom, left, right: !left})}
            style={{width: this.props.width, zIndex: 9}}
            onMouseEnter={this.props.onMouseEnter}
            onMouseLeave={this.props.onMouseLeave}
            ref='container'
          >
            <style jsx>{`
              .tether {
                @p: .bgBlue, .white, .f16, .flex, .flexColumn, .overlayShadow, .br2;
                margin-top: 20px;
                line-height: 20px;
              }
              .tether-content {
                @p: .pv12, .ph16;
              }

              .tether.left:before {
                left: 0;
                margin-left: 13px;
              }

              .tether.right:before {
                right: 0;
                margin-right: 13px;
              }

              .tether:before {
                width: 0;
                height: 0;
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                content: ' ';
                position: absolute;
              }

              .tether.bottom:before {
                margin-top: 20px;
                border-bottom: 10px solid $blue;
                top: -10px;
              }

              .tether.top:before {
                margin-bottom: -20px;
                border-top: 10px solid $blue;
                bottom: 10px;
              }

              h2 {
                @p: .f20, .fw6, .lhTitle;
              }

              p {
                @p: .white80, .f14, .mt10;
              }

              .btn {
                @p: .buttonShadow, .bgWhite, .blue, .ttu, .f12, .br2, .mt16, .fw6, .dib, .pointer;
                letter-spacing: 0.5px;
                padding: 8px 11px;
              }
            `}</style>
            <div className='tether-content'>
              <h2>
                {step.title}
              </h2>
              {step.description && (
                <p>
                  {step.description}
                </p>
              )}
              {step.buttonText && (
                <div className='btn' onClick={(e) => this.props.onClick(e, step)}>
                  {step.buttonText}
                </div>
              )}
            </div>
          </div>
        )}
      </TetherComponent>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    gettingStartedState: state.gettingStarted.gettingStartedState,
  }
}

export default connect(mapStateToProps)(Tether)
