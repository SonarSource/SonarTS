import * as React from 'react'
import { ISO8601 } from '../../utils/constants'
import * as moment from 'moment'
import { Moment } from 'moment'
import ClickOutside from 'react-click-outside'
import Datetime from 'react-datetime'
const classes: any = require('./Datepicker.scss')

// TODO remove once closed: https://github.com/YouCanBookMe/react-datetime/issues/44

if (Datetime) {
  Datetime.prototype.componentWillReceiveProps = function (nextProps) {
    if (this.props.open !== nextProps.open) {
      this.setState({ open: nextProps.open })
    }
  }
}

require('react-datetime/css/react-datetime.css')
require('./react-datetime.override.css')

interface Props {
  applyImmediately: boolean
  defaultOpen: boolean
  autoClose?: boolean
  className?: string
  defaultValue: Date
  onChange: (m: Moment) => void
  onKeyDown?: (e: any) => void
  onCancel?: () => void
  // NOTE custom `onFocus` impl needed because overriding this property breaks the package
  onFocus?: () => void
  onClickOutside?: (moment: Moment) => void
  [key: string]: any
  active: boolean
}

interface State {
  moment: Moment
  open: boolean
}

export default class DatePicker extends React.Component<Props, State> {

  refs: {
    [key: string]: any
    container: Element,
  }

  constructor (props) {
    super(props)

    this.state = {
      moment: moment.utc(props.defaultValue, ISO8601),
      open: props.defaultOpen || false,
    }

    this.onKeyDown = this.onKeyDown.bind(this)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  render () {
    const passThroughProps: any = Object.assign({}, this.props)

    delete passThroughProps.onChange
    delete passThroughProps.dateFormat
    delete passThroughProps.className
    delete passThroughProps.inputProps
    delete passThroughProps.open
    delete passThroughProps.onFocus

    return (
      <div
        className={`${classes.root} ${this.props.className}`}
        onClick={() => this.markOpen()}
        ref='container'
      >
        <ClickOutside onClickOutside={() => {
          if (this.props.autoClose) {
            this.setState({open: false} as State)
          }
          if (typeof this.props.onClickOutside === 'function') {
            this.props.onClickOutside(this.state.moment)
          }
        }}>
          <Datetime
            {...passThroughProps}
            className={classes.datetime}
            dateFormat='YYYY-MM-DD'
            timeFormat='HH:mm:ssZZ'
            onChange={(m) => this.onChange(m)}
            open={this.state.open}
          />
        </ClickOutside>
      </div>
    )
  }

  private onKeyDown = (e: any) => {
    if (e.target instanceof HTMLInputElement) {
      return
    }
    if (!this.props.active) {
      return
    }
    // fake event data, as the document doesn't have a value ...
    e.target.value = this.state.moment
    if (typeof this.props.onKeyDown === 'function') {
      this.props.onKeyDown(e)
    }
  }

  private onChange (m: Moment) {
    if (this.props.applyImmediately) {
      this.applyChange(m)
    } else {
      this.setState({ moment: m } as State)
    }
  }

  private applyChange (m: Moment) {
    this.setState({ open: false } as State)
    this.props.onChange(m)
  }

  private markOpen () {
    if (!this.state.open) {
      this.setState({ open: true } as State)

      if (this.props.onFocus) {
        this.props.onFocus()
      }
    }
  }
}
