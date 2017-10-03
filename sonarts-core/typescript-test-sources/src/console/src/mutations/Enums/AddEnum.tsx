import * as Relay from 'react-relay'

interface Props {
  projectId: string
  name: string
  values: string[]
}

export default class AddEnumMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{addEnum}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on AddEnumPayload {
        enumEdge
        project
      }
    `
  }

  getConfigs () {
    return [{
      type: 'RANGE_ADD',
      parentName: 'project',
      parentID: this.props.projectId,
      connectionName: 'enums',
      edgeName: 'enumEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }]
  }

  getVariables () {
    return this.props
  }
}
