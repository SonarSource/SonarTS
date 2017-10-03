import * as Relay from 'react-relay'

interface Props {
  id: string
  isActive: boolean
}

interface Response {
}

export default class ToggleRelationPermissionMutation extends Relay.Mutation<Props, Response> {

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

  getOptimisticResponse () {
    return {
      relationPermission: {
        id: this.props.id,
        isActive: this.props.isActive,
      },
    }
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        relationPermission: this.props.id,
      },
    }]
  }

  getVariables () {
    return this.props
  }
}
