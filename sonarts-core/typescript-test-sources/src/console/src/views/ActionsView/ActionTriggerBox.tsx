import * as React from 'react'
import * as Relay from 'react-relay'
import { Project, ActionTriggerMutationModelMutationType } from '../../types/types'
import {Icon} from 'graphcool-styles'
const QueryEditor: any = require('../SchemaView/Editor/QueryEditor').QueryEditor
import ActionTrigger from './ActionTrigger'
import Tooltip from 'rc-tooltip'
const classes: any = require('./ActionTriggerBox.scss')
import {$p} from 'graphcool-styles'
import * as cx from 'classnames'

interface Props {
  triggerMutationModelMutationType: ActionTriggerMutationModelMutationType
  triggerMutationModelModelId: string
  triggerMutationModelFragment: string
  schema: any | null
  valid: boolean
  project: Project
  update: (payload: UpdateTriggerPayload) => void
}

export interface UpdateTriggerPayload {
  triggerMutationModelMutationType?: ActionTriggerMutationModelMutationType
  triggerMutationModelModelId?: string
  triggerMutationModelFragment?: string
}

class ActionTriggerBox extends React.Component<Props, {}> {

  render() {
    let queryEditor = null
    if (this.props.schema) {
      queryEditor = (
        <QueryEditor
          schema={this.props.schema}
          value={this.props.triggerMutationModelFragment}
          onEdit={(query) => this.props.update({ triggerMutationModelFragment: query })}
        />
      )
    } else {
      queryEditor = (
        <div className={classes.noQuery}>
          {'After you selected your trigger and mutation, ' +
           'you need to specify a GraphQL fragment from it to use for the handler.'}
        </div>
      )
    }

    return (
      <div className={classes.root}>

        <div className={classes.head}>
          <div className={classes.title}>Trigger</div>
          {!this.props.valid &&
          <Tooltip
            placement={'bottom'}
            overlay={
              <span onClick={(e) => e.stopPropagation()}>
                Please specify the model and the mutation type.
              </span>
            }
          >
            <Icon
              width={24}
              height={24}
              src={require('assets/new_icons/warning.svg')}
              color={'#F5A623'}
            />
          </Tooltip>
          }
          {this.props.valid &&
            <Icon
              width={24}
              height={24}
              src={require('assets/new_icons/check.svg')}
              color={'#7ED321'}
            />
          }
        </div>

        <div className={classes.trigger}>
          <ActionTrigger
            project={this.props.project}
            update={this.handleUpdate}
            triggerMutationModelMutationType={this.props.triggerMutationModelMutationType}
            triggerMutationModelModelId={this.props.triggerMutationModelModelId}
          />
        </div>
        {this.props.schema &&
        <div className={classes.info}>
          Specify a query for your action handler payload
        </div>}
        <div className={cx(classes.query, $p.bgDarkerBlue)}>
          {queryEditor}
        </div>
      </div>
    )
  }

  private handleUpdate = (payload: UpdateTriggerPayload) => {
    if (this.props.triggerMutationModelModelId && payload.triggerMutationModelMutationType &&
       !this.props.triggerMutationModelFragment) {
      payload.triggerMutationModelFragment = this.getDefaultSchema(payload)
    }
    this.props.update(payload)
  }

  private getDefaultSchema = (payload: UpdateTriggerPayload) => {
    const type = payload.triggerMutationModelMutationType
    return `{\n  ${type.toString().toLowerCase()}dNode{\n    id\n  }\n}`
  }
}

export default Relay.createContainer(ActionTriggerBox, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id
        ${ActionTrigger.getFragment('project')}
      }
    `,
  },
})
