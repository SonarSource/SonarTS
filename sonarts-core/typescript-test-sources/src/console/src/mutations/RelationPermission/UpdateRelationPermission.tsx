import * as Relay from 'react-relay'
import {RelationPermission} from '../../types/types'

interface Response {
}

export default class UpdateRelationPermissionMutation extends Relay.Mutation<RelationPermission, Response> {

  getMutation () {
    return Relay.QL`mutation{updateRelationPermission}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateRelationPermissionPayload {
        relationPermission
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        relationPermission: this.props.id,
      },
    }]
  }

  getOptimisticResponse () {
    return {
      relationPermission: this.props,
    }
  }

  getVariables () {
    return this.props
  }
}
