import * as Relay from 'react-relay'

interface Props {
  actionId: string
  projectId: string
}

export default class DeleteActionMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{deleteAction}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DeleteActionPayload {
        project
        deletedId
      }
    `
  }

  getConfigs () {
    return [{
      type: 'NODE_DELETE',
      parentName: 'project',
      parentID: this.props.projectId,
      connectionName: 'actions',
      deletedIDFieldName: 'deletedId',
    }]
  }

  getVariables () {
    return {
      actionId: this.props.actionId,
    }
  }

  getOptimisticResponse () {
    return {
      deletedId: this.props.actionId,
    }
  }
}
