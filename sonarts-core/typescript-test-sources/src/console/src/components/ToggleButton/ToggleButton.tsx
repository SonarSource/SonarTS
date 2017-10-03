import * as React from 'react'
const classes: any = require('./ToggleButton.scss')
import {classnames} from '../../utils/classnames'

export enum ToggleSide {
  Left,
  Right,
}

interface Props {
  side: ToggleSide
  leftText: string
  rightText: string
  onChange?: (ToggleSide) => void
  onClickOutside?: (ToggleSide) => void
  onKeyDown?: (e: any) => void
  onBlur?: (e: any) => void
  active: boolean
  ignoreKeyDown?: boolean
}

interface State {
  currentSide: ToggleSide
}

export default class ToggleButton extends React.Component<Props, State> {

  refs: {
    [key: string]: any
    container: Element,
  }

  rendered: number

  constructor (props) {
    super(props)

    this.state = {
      currentSide: this.props.side,
    }

    this.rendered = Date.now()
  }

  componentDidMount() {
    document.addEventListener('click', this.handle, true)
    document.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handle, true)
    document.removeEventListener('keydown', this.onKeyDown)
  }

  render() {
    return (
      <div
        className={classes.root}
        ref='container'
        onBlur={this.props.onBlur}
      >
        <span
          className={classnames(classes.label, {
            [classes.active]: this.state.currentSide === ToggleSide.Left,
          })}
          onClick={() => this.onUpdateClick(ToggleSide.Left)}
        >
          {this.props.leftText}
        </span>
        <span
          className={classnames(classes.label, {
            [classes.active]: this.state.currentSide === ToggleSide.Right,
          })}
          onClick={() => this.onUpdateClick(ToggleSide.Right)}
        >
          {this.props.rightText}
        </span>
      </div>
    )
  }

  handle = (e) => {
    if (!this.refs.container.contains(e.target) && this.props.onClickOutside) {
      this.props.onClickOutside(this.state.currentSide)
    }
  }

  private onKeyDown = (e: any) => {
    // we don't want to interfer with inputs
    if (e.target instanceof HTMLInputElement) {
      return
    }
    if (!this.props.active) {
      return
    }

    // space key
    if (e.keyCode === 32) {
      this.toggle()
      e.stopPropagation()
      return
    }

    // fake event data, as the document doesn't have a value ...
    e.target.value = this.state.currentSide === ToggleSide.Left ? 'true' : 'false' // tslint:disable-line
    if (typeof this.props.onKeyDown === 'function') {
      this.props.onKeyDown(e)
    }
  }

  private onUpdateClick (side) {
    // due to #332 it is important to ignore the first click
    if (Date.now() - this.rendered < 500) {
      return
    }

    this.onUpdateSide(side)
  }

  private onUpdateSide (side) {
    this.setState({ currentSide: side })
    if (this.props.onChange) {
      this.props.onChange(side)
    }
  }

  private toggle () {
    this.onUpdateSide(this.state.currentSide === ToggleSide.Left ? ToggleSide.Right : ToggleSide.Left)
  }

}
