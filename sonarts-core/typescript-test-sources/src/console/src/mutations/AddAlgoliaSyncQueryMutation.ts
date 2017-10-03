import * as Relay from 'react-relay'
import {pick} from 'lodash'

interface Props {
  modelId: string
  indexName: string
  fragment: string
  searchProviderAlgoliaId: string
}

export default class AddAlgoliaSyncQueryMutation extends Relay.Mutation<Props, Response> {

  getMutation() {
    console.log('calling addalgoliasyncquerymutation1', this.props)
    return Relay.QL`mutation{addAlgoliaSyncQuery}`
  }

  getFatQuery() {
    console.log('calling addalgoliasyncquerymutation2', this.props)
    return Relay.QL`
      fragment on AddAlgoliaSyncQueryPayload {
        searchProviderAlgolia
        algoliaSyncQueryEdge     
        algoliaSyncQueryConnection
      }
    `
  }

  getConfigs() {
    console.log('calling addalgoliasyncquerymutation3', this.props)
    return [{
      type: 'RANGE_ADD',
      parentName: 'searchProviderAlgolia',
      parentID: this.props.searchProviderAlgoliaId,
      connectionName: 'algoliaSyncQueries',
      edgeName: 'algoliaSyncQueryEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }]
  }

  getVariables() {
    console.log('calling addalgoliasyncquerymutation4', this.props)
    return pick(this.props, ['modelId', 'indexName', 'fragment'])
  }
}
