import * as Relay from 'react-relay'
import {UserType, Operation, PermissionRuleType} from '../../types/types'

interface Props {
  relationId: string
  connect: boolean
  disconnect: boolean
  userType: UserType
  rule: PermissionRuleType
  ruleName: string
  ruleGraphQuery?: string
  ruleWebhookUrl?: string
}

interface Response {
}

export default class AddRelationPermissionMutation extends Relay.Mutation<Props, Response> {

  getMutation () {
    return Relay.QL`mutation{addRelationPermission}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on AddRelationPermissionPayload {
        relationPermissionEdge
        relation
      }
    `
  }

  getConfigs () {
    return [{
      type: 'RANGE_ADD',
      parentName: 'relation',
      parentID: this.props.relationId,
      connectionName: 'permissions',
      edgeName: 'relationPermissionEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }]
  }

  getOptimisticResponse () {
    return {
      relationPermission: Object.assign({}, this.props, {
        isActive: true,
        rule: 'NONE',
      }),
    }
  }

  getVariables () {
    return {
      ...this.props,
      isActive: true,
    }
  }
}
