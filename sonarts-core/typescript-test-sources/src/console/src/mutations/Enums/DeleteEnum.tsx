import * as Relay from 'react-relay'

interface Props {
  enumId: string
  projectId: string
}

export default class DeleteEnumMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{deleteEnum}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DeleteEnumPayload {
        project
      }
    `
  }

  getConfigs () {
    return [{
      type: 'NODE_DELETE',
      parentName: 'project',
      parentID: this.props.projectId,
      connectionName: 'enums',
      deletedIDFieldName: 'enum { id }',
    }]
  }

  getVariables () {
    return {
      enumId: this.props.enumId,
    }
  }
}
