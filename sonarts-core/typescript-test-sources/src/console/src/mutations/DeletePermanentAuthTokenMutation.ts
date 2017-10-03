import * as Relay from 'react-relay'

interface Props {
  projectId: string
  tokenId: string
}

export default class DeletePermanentAuthTokenMutation extends Relay.Mutation<Props, {}> {

  getMutation() {
    return Relay.QL`mutation{deletePermanentAuthToken}`
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DeletePermanentAuthTokenPayload {
        deletedId
        project
      }
    `
  }

  getConfigs() {
    return [{
      type: 'NODE_DELETE',
      parentName: 'project',
      parentID: this.props.projectId,
      connectionName: 'permanentAuthTokens',
      deletedIDFieldName: 'deletedId',
    }]
  }

  getVariables() {
    return {
      permanentAuthTokenId: this.props.tokenId,
    }
  }

  getOptimisticResponse() {
    return {
      deletedId: this.props.tokenId,
    }
  }
}
