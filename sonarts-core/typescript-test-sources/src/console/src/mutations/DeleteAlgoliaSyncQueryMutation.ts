import * as Relay from 'react-relay'
import {Field, RelayConnection} from '../types/types'
import {isScalar} from '../utils/graphql'

interface Props {
  algoliaSyncQueryId: string
  searchProviderAlgoliaId: string
}

export default class DeleteAlgoliaSyncQueryMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{deleteAlgoliaSyncQuery}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DeleteAlgoliaSyncQueryPayload {
        searchProviderAlgolia
        deletedId
      }
    `
  }

  getConfigs () {
    return [{
      type: 'NODE_DELETE',
      parentName: 'searchProviderAlgolia',
      parentID: this.props.searchProviderAlgoliaId,
      connectionName: 'algoliaSyncQueries',
      deletedIDFieldName: 'deletedId',
    }]
  }

  getVariables () {
    return {
      algoliaSyncQueryId: this.props.algoliaSyncQueryId,
    }
  }
}
