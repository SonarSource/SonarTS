import * as Relay from 'react-relay'
import {ModelPermission} from '../../types/types'

interface Response {
}

export default class UpdatePermissionMutation extends Relay.Mutation<ModelPermission, Response> {

  getMutation () {
    return Relay.QL`mutation{updateModelPermission}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateModelPermissionPayload {
        modelPermission
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        modelPermission: this.props.id,
      },
    }]
  }

  getOptimisticResponse () {
    return {
      modelPermission: this.props,
    }
  }

  getVariables () {
    return this.props
  }
}
