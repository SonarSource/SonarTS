import * as Relay from 'react-relay'

interface Props {
  projectId: string
  functionId: string
}

export default class DeleteFunction extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{deleteFunction}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DeleteFunctionPayload {
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
      connectionName: 'functions',
      deletedIDFieldName: 'deletedId',
    }]
  }

  getVariables () {
    return {
      functionId: this.props.functionId,
    }
  }
}
