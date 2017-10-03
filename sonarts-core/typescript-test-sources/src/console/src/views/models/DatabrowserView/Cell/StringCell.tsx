import * as React from 'react'
import {CellProps} from './cells'
import {stringToValue} from '../../../../utils/valueparser'
import { connect } from 'react-redux'
import {nextStep} from '../../../../actions/gettingStarted'

// extend the interface for the onboarding functionality
declare module './cells' {
  interface CellProps<T> {
    nextStep?: () => void
    step?: string
  }
}

interface State {
  value: string
}

export class StringCell extends React.Component<CellProps<string>, State> {

  refs: {
    input: HTMLInputElement,
  }

  enterPressed: boolean

  constructor(props) {
    super(props)

    this.state = {
      value: props.value,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.refs.input.value = nextProps.value
    }
  }

  render() {
    const numLines = this.state.value ? this.state.value.split(/\r\n|\r|\n/).length : 1

    return (
      numLines > 1 ? (
        <textarea
          autoFocus
          type='text'
          ref='input'
          value={this.state.value}
          onKeyDown={this.onKeyDown}
          style={{
            height: Math.min(Math.max(56, numLines * 20), 300),
            width: '100%',
          }}
          onBlur={(e: any) => {
            if (this.enterPressed) {
              this.stopEvent(e)
              this.enterPressed = false
              return
            }
            this.props.save(stringToValue(e.target.value, this.props.field))
          }}
          onChange={this.onChange}
          placeholder='Enter a String...'
        />
      ) : (
        <input
          autoFocus
          type='text'
          ref='input'
          value={this.state.value}
          onKeyDown={this.onKeyDown}
          onBlur={(e: any) => {
            if (this.enterPressed) {
              this.stopEvent(e)
              this.enterPressed = false
              return
            }
            this.props.save(stringToValue(e.target.value, this.props.field))
          }}
          onChange={this.onChange}
          placeholder='Enter a String...'
        />
      )
    )
  }

  private stopEvent = (e: any) => {
    e.preventDefault()
    if (typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation()
    }
    if (typeof e.stopPropagation === 'function') {
      e.stopPropagation()
    }
  }

  private onKeyDown = (e: any) => {
    // filter arrow keys
    const numLines = e.target.value.split(/\r\n|\r|\n/).length
    if (e.keyCode === 13 && (e.metaKey || e.shiftKey)) {
      if (numLines === 1) {
        this.setState({value: e.target.value + '\n'})
        this.enterPressed = true
        this.stopEvent(e)
        return
      }
    }
    if ([37,38,39,40].includes(e.keyCode)) {
      return
    }
    this.props.onKeyDown(e)
  }

  private onChange = (e: any) => {
    const {value} = e.target
    this.setState({value})

    // ONLY FOR ONBOARDING
    if (typeof this.props.nextStep !== 'function') {
      return
    }
    if (
      e.target.value.includes('#graphcool') &&
      this.props.field.name === 'description' &&
      this.props.field.model.name === 'Post' &&
      // very important, otherwise each additional keystroke step through all steps
      this.props.step === 'STEP3_CLICK_ENTER_DESCRIPTION'
    ) {
      this.props.save(e.target.value)
      this.props.nextStep()
    }
  }
}

export default connect(
  state => ({
    step: state.gettingStarted.gettingStartedState.step,
  }),
  { nextStep },
)(StringCell)
