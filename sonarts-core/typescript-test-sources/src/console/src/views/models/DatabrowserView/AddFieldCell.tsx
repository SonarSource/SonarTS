import * as React from 'react'
import { Link } from 'react-router'
const classes: any = require('./AddFieldCell.scss')
import {ConsoleEvents} from 'graphcool-metrics'
import tracker from '../../../utils/metrics'

interface Props {
  params: any
}

export default class AddFieldCell extends React.Component<Props, {}> {

  render () {
    return (
      <div className={classes.root}>
        <Link
          to={`/${this.props.params.projectName}/schema/${this.props.params.modelName}/create`}
          onClick={() => {
            tracker.track(ConsoleEvents.Databrowser.addFieldClicked())
          }}
        >
          Add Field
        </Link>
      </div>
    )
  }
}
