import * as Relay from 'react-relay'

interface Props {
  relationPermissionId: string
  relationId: string
}

interface Response {
}

export default class DeleteRelationPermissionMutation extends Relay.Mutation<Props, Response> {

  getMutation () {
    return Relay.QL`mutation{deleteRelationPermission}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DeleteRelationPermissionPayload {
        relation
        deletedId
      }
    `
  }

  getConfigs () {
    return [{
      type: 'NODE_DELETE',
      parentName: 'relation',
      parentID: this.props.relationId,
      connectionName: 'permissions',
      deletedIDFieldName: 'deletedId',
    }]
  }

  getVariables () {
    return {
      relationPermissionId: this.props.relationPermissionId,
    }
  }

  getOptimisticResponse () {
    return {
      deletedId: this.props.relationPermissionId,
    }
  }
}
