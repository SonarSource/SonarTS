import * as Relay from 'react-relay'

interface Props {
  projectId: string
  tokenName: string
}

export default class AddPermanentAuthTokenMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{addPermanentAuthToken}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on AddPermanentAuthTokenPayload {
        permanentAuthTokenEdge
        project
      }
    `
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'project',
      parentID: this.props.projectId,
      connectionName: 'permanentAuthTokens',
      edgeName: 'permanentAuthTokenEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }]
  }

  getVariables() {
    return {
      projectId: this.props.projectId,
      name: this.props.tokenName,
    }
  }
}
