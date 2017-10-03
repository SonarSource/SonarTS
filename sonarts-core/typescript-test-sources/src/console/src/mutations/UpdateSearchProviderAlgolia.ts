import * as Relay from 'react-relay'
import {pick} from 'lodash'

interface Props {
  searchProviderAlgoliaId: string
  isEnabled: boolean
  apiKey: string
  applicationId: string
  projectId: string
}

export default class UpdateSearchProviderAlgolia extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{updateSearchProviderAlgolia}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateSearchProviderAlgoliaPayload {
        searchProviderAlgolia
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        searchProviderAlgolia: this.props.searchProviderAlgoliaId,
      },
    }]
  }

  getVariables () {
    return pick(this.props, ['isEnabled', 'apiKey', 'applicationId', 'projectId'])
  }

  getOptimisticResponse () {
    const {searchProviderAlgoliaId, isEnabled, apiKey, applicationId} = this.props
    return {
      searchProviderAlgolia: {
        id: searchProviderAlgoliaId,
        isEnabled,
        apiKey,
        applicationId,
      },
    }
  }
}
