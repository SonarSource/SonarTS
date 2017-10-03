import * as React from 'react'
const classes: any = require('./Cell.scss')
import * as cx from 'classnames'
import {$p} from 'graphcool-styles'
import {valueToString} from '../../../utils/valueparser'
import {Field} from '../../../types/types'
import tracker from '../../../utils/metrics'
import {ConsoleEvents, InputSource} from 'graphcool-metrics'

interface Props {
  onClick: (e: any) => void
  onDoubleClick: () => void
  value: string
  field: Field
  rowSelected?: boolean
  rowHasCursor?: boolean
}
export class LightCell extends React.PureComponent<Props, {}> {
  render() {
    const {onClick, onDoubleClick, value, field, rowSelected, rowHasCursor} = this.props
    const valueString = valueToString(value, field, true)

    return (
      <div
        onClick={(e: any) => {
          onClick(e)
          tracker.track(ConsoleEvents.Databrowser.Cell.selected({source: 'Click' as InputSource}))
        }}
        onDoubleClick={onDoubleClick}
        className={cx(
          classes.root,
          $p.contentCenter,
          $p.overflowVisible,
          $p.flexAuto,
          {
            [$p.bgWhite]: (!rowHasCursor && !rowSelected),
            [$p.bgBlue]: rowSelected,
            [$p.white]: rowSelected,
          },
        )}
      >
        <div className={cx(classes.border, $p.flexAuto)}>
          <div className={classes.value}>
            {valueString}
          </div>
        </div>
      </div>
    )
  }
}
