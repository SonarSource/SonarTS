import * as Relay from 'react-relay'
import { ActionTriggerType, ActionHandlerType, ActionTriggerMutationModelMutationType } from '../types/types'

interface Props {
  actionId: string
  isActive?: boolean
  description?: string
  triggerType?: ActionTriggerType
  handlerType?: ActionHandlerType
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

export default class UpdateActionMutation extends Relay.Mutation<Props, Response> {

  getMutation () {
    return Relay.QL`mutation{updateAction}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateActionPayload {
        action
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        action: this.props.actionId,
      },
    }]
  }

  getVariables () {
    return {
      actionId: this.props.actionId,
      isActive: this.props.isActive,
      description: this.props.description,
      triggerType: this.props.triggerType,
      handlerType: this.props.handlerType,
      triggerMutationModel: this.props.triggerMutationModel,
      handlerWebhook: this.props.handlerWebhook,
    }
  }

  getOptimisticResponse () {
    return {
      action: {
        id: this.props.actionId,
        isActive: this.props.isActive,
        description: this.props.description,
        triggerType: this.props.triggerType,
        handlerType: this.props.handlerType,
        triggerMutationModel: this.props.triggerMutationModel,
        handlerWebhook: this.props.handlerWebhook,
      }.filterNullAndUndefined(),
    }
  }
}
