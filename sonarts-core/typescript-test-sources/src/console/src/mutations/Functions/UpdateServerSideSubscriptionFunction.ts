import * as Relay from 'react-relay'
import {FunctionBinding, FunctionType} from '../../types/types'
import {pick} from 'lodash'

interface Props {
  id: string
  projectId: string
  name: string
  type?: FunctionType
  webhookUrl: string
  headers?: string
  inlineCode?: string
  auth0Id?: string
  isActive: boolean
  functionId?: string
  query: string
}

export default class UpdateServerSideSubscriptionFunction extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{updateServerSideSubscriptionFunction}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateServerSideSubscriptionFunctionPayload {
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
      'name', 'isActive', 'query',
      'type', 'webhookUrl', 'headers', 'inlineCode', 'auth0Id', 'functionId',
    ])
  }
}
