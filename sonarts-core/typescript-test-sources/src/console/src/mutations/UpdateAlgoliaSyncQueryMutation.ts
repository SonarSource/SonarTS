import * as Relay from 'react-relay'
import {pick} from 'lodash'

interface Props {
  algoliaSyncQueryId: string
  isEnabled: boolean
  indexName: string
  fragment: string
}

export default class UpdateAlgoliaSyncQueryMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{updateAlgoliaSyncQuery}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateAlgoliaSyncQueryPayload {
        searchProviderAlgolia
        algoliaSyncQuery
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        algoliaSyncQuery: this.props.algoliaSyncQueryId,
      },
    }]
  }

  getVariables () {
    return pick(this.props, ['algoliaSyncQueryId', 'indexName', 'fragment', 'isEnabled'])
  }

  getOptimisticResponse () {
    const {algoliaSyncQueryId, isEnabled, indexName, fragment} = this.props
    return {
      algoliaSyncQuery: {
        id: algoliaSyncQueryId,
        isEnabled,
        indexName,
        fragment,
      },
    }
  }
}
