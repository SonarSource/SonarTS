import * as Relay from 'react-relay'

interface Props {
  projectId: string
  modelName: string
  description?: string
}

export default class AddModelMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{addModel}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on AddModelPayload {
        modelEdge
        project
      }
    `
  }

  getConfigs () {
    return [{
      type: 'RANGE_ADD',
      parentName: 'project',
      parentID: this.props.projectId,
      connectionName: 'models',
      edgeName: 'modelEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }]
  }

  getVariables () {
    return {
      projectId: this.props.projectId,
      modelName: this.props.modelName,
      description: this.props.description,
    }
  }
}
