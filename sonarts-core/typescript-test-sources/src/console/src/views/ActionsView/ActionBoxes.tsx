import * as React from 'react'
import * as Relay from 'react-relay'
import styled from 'styled-components'
import {
  Action,
  Project,
  ActionTriggerMutationModelMutationType,
  ActionTriggerType,
  ActionHandlerType,
} from '../../types/types'
import { buildClientSchema } from 'graphql'
import {particles, variables, $p} from 'graphcool-styles'
import { validate } from 'graphql/validation'
import { parse } from 'graphql/language'
import AddActionMutation from '../../mutations/AddActionMutation'
import UpdateActionMutation from '../../mutations/UpdateActionMutation'
import ActionTriggerBox from './ActionTriggerBox'
import ActionHandlerBox from './ActionHandlerBox'
import { UpdateTriggerPayload } from './ActionTriggerBox'
import { UpdateHandlerPayload } from './ActionHandlerBox'
import { isValidMutationCallbackUrl } from '../../utils/utils'
const classes: any = require('./ActionBoxes.scss')
import * as cx from 'classnames'
import tracker from '../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'

interface Props {
  action?: Action
  project: Project
  relay: Relay.RelayProp
  close: () => void
}

interface State {
  triggerMutationModelMutationType: ActionTriggerMutationModelMutationType
  triggerMutationModelModelId: string
  triggerMutationModelFragment: string
  schema: any | null
  triggerValid: boolean
  handlerValid: boolean
  handlerWebhookUrl: string
  description: string
  changesMade: boolean
}

function extractSchema ({ schemaString, query }): { schema: any, valid: boolean } {
  const schema = schemaString
    ? buildClientSchema(JSON.parse(schemaString))
    : null

  let valid = false
  if (schema && query) {
    try {
      valid = validate(schema, parse(query)).length === 0
    } catch (err) {
      // ignore
    }
  }

  return { schema, valid }
}

class ActionBoxes extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    const { action } = props

    const triggerMutationModelModelId = action ? action.triggerMutationModel.model.id : ''
    const triggerMutationModelFragment = action ? action.triggerMutationModel.fragment : ''
    const triggerMutationModelMutationType = action ? action.triggerMutationModel.mutationType : ''
    const handlerWebhookUrl = action && action.handlerWebhook ? action.handlerWebhook.url : ''

    const { schema, valid } = extractSchema({
      schemaString: props.project.actionSchema,
      query: triggerMutationModelFragment,
    })

    this.state = {
      triggerMutationModelMutationType,
      triggerMutationModelModelId,
      triggerMutationModelFragment,
      schema,
      triggerValid: valid,
      handlerValid: isValidMutationCallbackUrl(handlerWebhookUrl),
      handlerWebhookUrl,
      description: action ? action.description : '',
      changesMade: false,
    }

    props.relay.setVariables({
      selectedModelMutationType: triggerMutationModelMutationType,
      selectedModelId: triggerMutationModelModelId,
      hasSelectedModelId: !!action,
    })
  }

  componentWillMount () {
    this.props.relay.forceFetch()
  }

  componentWillReceiveProps (props: Props) {
    const { schema, valid } = extractSchema({
      schemaString: props.project.actionSchema,
      query: this.state.triggerMutationModelFragment,
    })
    this.setState({ schema, triggerValid: valid } as State)
  }

  render() {
    const Button = styled.button`
      padding: ${variables.size16};
      font-size: ${variables.size16};
      border: none;
      background: none;
      color: ${variables.gray50};
      border-radius: 2px;
      cursor: pointer;
      transition: color ${variables.duration} linear;

      &:hover {
        color: ${variables.gray70};
      }
    `

    const DeleteButton = styled(Button)`
      background: ${variables.red};
      color: ${variables.white};

      &:hover {
        color: ${variables.white};
      }
    `
    return (
      <div className={classes.root}>
        <div>
          <div
            className={cx(
              classes.header,
              particles.flex,
              particles.justifyBetween,
            )}
          >
            <div
              className={cx(
                particles.contentStart,
              )}
            >
              {!this.props.action ?
                'New Mutation Callback' : 'Edit Mutation Callback'
              }
            </div>
            <div
              className={cx(
                particles.flex,
                particles.justifyBetween,
              )}
            >
              <DeleteButton
                className={cx(
                  particles.mr25,
                )}
                onClick={this.cancel}
              >
                Cancel
              </DeleteButton>
              {this.renderConfirm()}
            </div>
          </div>
          <input
            className={classes.description}
            placeholder={'+ Add Description'}
            value={this.state.description}
            onChange={(e: any) => this.setState({description: e.target.value, changesMade: true} as State)}
          />
        </div>
        <div className={classes.boxes}>
          <ActionTriggerBox
            triggerMutationModelMutationType={this.state.triggerMutationModelMutationType}
            triggerMutationModelModelId={this.state.triggerMutationModelModelId}
            triggerMutationModelFragment={this.state.triggerMutationModelFragment}
            schema={this.state.schema}
            valid={this.state.triggerValid}
            project={this.props.project}
            update={this.onUpdateTrigger}
            />
          <ActionHandlerBox
            handlerWebhookUrl={this.state.handlerWebhookUrl}
            valid={this.state.handlerValid}
            update={this.onUpdateHandler}
            disabled={!this.state.triggerValid}
          />
        </div>

      </div>
    )
  }

  private onUpdateTrigger = (payload: UpdateTriggerPayload) => {
    let partialState = payload.filterNullAndUndefined() as State
    partialState.changesMade = true

    if (payload.triggerMutationModelFragment) {
      const { valid, schema } = extractSchema({
        schemaString: this.props.project.actionSchema,
        query: payload.triggerMutationModelFragment,
      })
      partialState.triggerValid = valid
      partialState.schema = schema
    }

    this.setState(partialState)

    if (payload.triggerMutationModelModelId) {
      this.props.relay.setVariables({ selectedModelId: payload.triggerMutationModelModelId })
    }

    if (payload.triggerMutationModelMutationType) {
      this.props.relay.setVariables({
        selectedModelMutationType: payload.triggerMutationModelMutationType,
        hasSelectedModelId: true,
      })
    }
  }

  private onUpdateHandler = (payload: UpdateHandlerPayload) => {
    let partialState = payload.filterNullAndUndefined() as State
    partialState.changesMade = true
    if (payload.handlerWebhookUrl) {
      partialState.handlerValid = isValidMutationCallbackUrl(payload.handlerWebhookUrl)
    }
    this.setState(partialState)
  }

  private cancel = () => {
    if (!this.state.changesMade) {
      this.props.close()
    } else {
      graphcoolConfirm('This action could lead to massive data loss.', 'Unsaved Changes')
        .then(() => {
          this.props.close()
        })
    }
    if (this.props.action) {
      tracker.track(ConsoleEvents.MutationCallbacks.canceled({type: 'Update'}))
    } else {
      tracker.track(ConsoleEvents.MutationCallbacks.canceled({type: 'Create'}))
    }
  }

  private submit = () => {
    if (!this.state.triggerValid || !this.state.handlerValid) {
      return
    }

    if (this.props.action) {
      this.updateAction()
      tracker.track(ConsoleEvents.MutationCallbacks.submitted({type: 'Update'}))
    } else {
      tracker.track(ConsoleEvents.MutationCallbacks.submitted({type: 'Create'}))
      this.createAction()
    }
  }

  private createAction = () => {
    Relay.Store.commitUpdate(
      new AddActionMutation({
        projectId: this.props.project.id,
        isActive: true,
        description: this.state.description,
        triggerType: 'MUTATION_MODEL' as ActionTriggerType,
        handlerType: 'WEBHOOK' as ActionHandlerType,
        triggerMutationModel: {
          fragment: this.state.triggerMutationModelFragment,
          mutationType: this.state.triggerMutationModelMutationType,
          modelId: this.state.triggerMutationModelModelId,
        },
        handlerWebhook: {
          url: this.state.handlerWebhookUrl,
        },
      }),
      {
        onSuccess: () => {
          this.props.close()
        },
      },
    )
  }

  private updateAction = () => {
    Relay.Store.commitUpdate(
      new UpdateActionMutation({
        actionId: this.props.action.id,
        isActive: this.props.action.isActive,
        description: this.state.description,
        triggerType: 'MUTATION_MODEL' as ActionTriggerType,
        handlerType: 'WEBHOOK' as ActionHandlerType,
        triggerMutationModel: {
          fragment: this.state.triggerMutationModelFragment,
          mutationType: this.state.triggerMutationModelMutationType,
          modelId: this.state.triggerMutationModelModelId,
        },
        handlerWebhook: {
          url: this.state.handlerWebhookUrl,
        },
      }),
      {
        onSuccess: () => {
          this.props.close()
        },
      },
    )
  }

  private renderConfirm = () => {
    if (!this.state.changesMade || !this.state.triggerValid || !this.state.handlerValid) {
      return (
        <div className={cx(
          particles.f16,
          particles.pa16,
        )
        }>No changes</div>
      )
    }

    return (
      <div
        className={cx(
          $p.pa16,
          $p.f16,
          $p.white,
          $p.br2,
          $p.bgGreen,
          $p.pointer,
        )}
        onClick={this.submit}
      >
        Confirm
      </div>
    )
  }
}

export default Relay.createContainer(ActionBoxes, {
  initialVariables: {
    selectedModelId: null,
    selectedModelMutationType: null,
    hasSelectedModelId: false,
  },
  fragments: {
    action: () => Relay.QL`
      fragment on Action {
        id
        description
        triggerType
        handlerType
        triggerMutationModel {
          model {
            id
            name
          }
          mutationType
          fragment
        }
        handlerWebhook {
          url
        }
      }
    `,
    project: () => Relay.QL`
      fragment on Project {
        id
        actionSchema(
          modelId: $selectedModelId
          modelMutationType: $selectedModelMutationType
        ) @include(if: $hasSelectedModelId)
        ${ActionTriggerBox.getFragment('project')}
        models(first: 1000) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
  },
})
