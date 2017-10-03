import * as React from 'react'
import Datepicker from '../../../../components/Datepicker/Datepicker'
import {CellProps} from './cells'
import {Moment} from 'moment'

const classes: any = require('../Cell.scss')

export default class DateTimeCell extends React.Component<CellProps<Date>, {}> {

  resolveInput = (m: Moment | string) => {
    if (typeof m === 'string') {
      return new Date(m)
    } else {
      return m.toDate()
    }
  }

  render() {
    return (
      <Datepicker
        className={classes.datepicker}
        defaultValue={this.props.value || new Date()}
        active={true}
        onChange={(m: Moment | string) => this.props.save(this.resolveInput(m))}
        onCancel={() => this.props.cancel()}
        autoClose={this.props.inList}
        defaultOpen={true}
        applyImmediately={false}
        onKeyDown={this.props.onKeyDown}
        onClickOutside={moment => this.props.save(moment.toDate())}
      />)
  }
}
