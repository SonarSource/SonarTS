import * as Relay from 'react-relay'

interface Props {
  projectId: string
  name: string
  customerId: string
  includeData: boolean
  includeMutationCallbacks: boolean
}

export default class CloneProjectMutation extends Relay.Mutation<Props, {}> {
  getMutation () {
    return Relay.QL`mutation{cloneProject}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on CloneProjectPayload {
        projectEdge
        user
      }
    `
  }

  getConfigs () {
    return [{
      type: 'RANGE_ADD',
      parentName: 'user',
      parentID: this.props.customerId,
      connectionName: 'projects',
      edgeName: 'projectEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }]
  }

  getVariables () {
    return {
      projectId: this.props.projectId,
      name: this.props.name,
      includeData: this.props.includeData,
      includeMutationCallbacks: this.props.includeMutationCallbacks,
    }
  }
}
