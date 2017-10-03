import * as Relay from 'react-relay'

interface Props {
  modelPermissionId: string
  modelId: string
}

interface Response {
}

export default class DeleteModelPermissionMutation extends Relay.Mutation<Props, Response> {

  getMutation () {
    return Relay.QL`mutation{deleteModelPermission}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DeleteModelPermissionPayload {
        model
        deletedId
      }
    `
  }

  getConfigs () {
    return [{
      type: 'NODE_DELETE',
      parentName: 'model',
      parentID: this.props.modelId,
      connectionName: 'permissions',
      deletedIDFieldName: 'deletedId',
    }]
  }

  getVariables () {
    return {
      modelPermissionId: this.props.modelPermissionId,
    }
  }

  getOptimisticResponse () {
    return {
      deletedId: this.props.modelPermissionId,
    }
  }
}
