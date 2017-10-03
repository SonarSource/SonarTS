import * as Relay from 'react-relay'

interface Props {
  id: string
  isActive: boolean
}

interface Response {
}

export default class ToggleActivePermissionMutation extends Relay.Mutation<Props, Response> {

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

  getOptimisticResponse () {
    return {
      modelPermission: {
        id: this.props.id,
        isActive: this.props.isActive,
      },
    }
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        modelPermission: this.props.id,
      },
    }]
  }

  getVariables () {
    return this.props
  }
}
