import * as Relay from 'react-relay'

interface Props {
  projectId: string,
  customerId: string
}

export default class DeleteProjectMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{deleteProject}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DeleteProjectPayload {
        user { projects }
        deletedId
      }
    `
  }

  getConfigs () {
    return [{
      type: 'NODE_DELETE',
      parentName: 'user',
      parentID: this.props.customerId,
      connectionName: 'projects',
      deletedIDFieldName: 'deletedId',
    }]
  }

  getVariables () {
    return {
      projectId: this.props.projectId,
    }
  }

  getOptimisticResponse () {
    return {
      deletedId: this.props.projectId,
    }
  }
}
