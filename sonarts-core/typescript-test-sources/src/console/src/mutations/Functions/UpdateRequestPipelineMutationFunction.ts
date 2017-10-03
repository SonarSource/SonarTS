import * as Relay from 'react-relay'
import {FunctionBinding, FunctionType} from '../../types/types'
import {pick} from 'lodash'

interface Props {
  id: string
  projectId: string
  name: string
  binding?: FunctionBinding
  modelId?: string
  type?: FunctionType
  webhookUrl: string
  webhookHeaders?: string
  inlineCode?: string
  auth0Id?: string
  operation?: string
  isActive: boolean
  functionId?: string
}

export default class UpdateRequestPipelineMutationFunction extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{updateRequestPipelineMutationFunction}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateRequestPipelineMutationFunctionPayload {
        function
        project
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        function: this.props.id,
      },
    }]
  }

  getVariables () {
    return pick(this.props, [
      'name', 'isActive', 'binding', 'modelId', 'operation',
      'type', 'webhookUrl', 'webhookHeaders', 'inlineCode', 'auth0Id', 'functionId',
    ])
  }
}
