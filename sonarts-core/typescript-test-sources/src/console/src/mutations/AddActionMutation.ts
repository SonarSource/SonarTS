import * as Relay from 'react-relay'
import { ActionTriggerType, ActionHandlerType, ActionTriggerMutationModelMutationType } from '../types/types'

interface Props {
  projectId: string
  isActive: boolean
  description: string
  triggerType: ActionTriggerType
  handlerType: ActionHandlerType
  triggerMutationModel?: TriggerMutationModelProps
  handlerWebhook?: HandlerWebhookProps
}

interface TriggerMutationModelProps {
  fragment: string
  mutationType: ActionTriggerMutationModelMutationType
  modelId: string
}

interface HandlerWebhookProps {
  url: string
}

interface Response {
}

export default class AddActionMutation extends Relay.Mutation<Props, Response> {

  getMutation() {
    return Relay.QL`mutation{addAction}`
  }

  getFatQuery() {
    return Relay.QL`
      fragment on AddActionPayload {
        actionEdge
        project
      }
    `
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'project',
      parentID: this.props.projectId,
      connectionName: 'actions',
      edgeName: 'actionEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }]
  }

  getVariables() {
    return this.props
  }
}
