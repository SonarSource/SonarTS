import * as Relay from 'react-relay'
import {AuthProviderDigits, AuthProviderAuth0} from '../types/types'

interface Props {
  authProviderId: string
  isEnabled: boolean
  digits: AuthProviderDigits | null
  auth0: AuthProviderAuth0 | null
}

interface Response {
}

export default class UpdateAuthProviderMutation extends Relay.Mutation<Props, Response> {

  getMutation() {
    return Relay.QL`mutation{updateAuthProvider}`
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateAuthProviderPayload {
        authProvider
      }
    `
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        authProvider: this.props.authProviderId,
      },
    }]
  }

  getVariables() {
    return {
      id: this.props.authProviderId,
      isEnabled: this.props.isEnabled,
      // this explicitness is needed because otherwise relay passes `__dataID__` along
      digits: !this.props.digits ? null : {
        consumerKey: this.props.digits.consumerKey,
        consumerSecret: this.props.digits.consumerSecret,
      },
      // this explicitness is needed because otherwise relay passes `__dataID__` along
      auth0: !this.props.auth0 ? null : {
        domain: this.props.auth0.domain,
        clientId: this.props.auth0.clientId,
        clientSecret: this.props.auth0.clientSecret,
      },
    }
  }
}
