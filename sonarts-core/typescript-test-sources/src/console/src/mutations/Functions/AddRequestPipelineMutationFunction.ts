import * as Relay from 'react-relay'
import {FunctionBinding, FunctionType} from '../../types/types'
import {pick} from 'lodash'

interface Props {
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
}

export default class AddRequestPipelineMutationFunction extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{addRequestPipelineMutationFunction}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on AddRequestPipelineMutationFunctionPayload {
        function
        project
      }
    `
  }

  getConfigs () {
    return [{
      type: 'RANGE_ADD',
      parentName: 'project',
      parentID: this.props.projectId,
      connectionName: 'functions',
      edgeName: 'functionEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }]
  }

  getVariables () {
    return pick(this.props, [
      'projectId', 'name', 'isActive', 'binding', 'modelId', 'operation',
      'type', 'webhookUrl', 'inlineCode', 'auth0Id', 'webhookHeaders',
    ])
  }
}
