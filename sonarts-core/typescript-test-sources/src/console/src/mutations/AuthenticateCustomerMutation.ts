import * as Relay from 'react-relay'
import { User } from '../types/types'

interface Props {
  auth0IdToken: string
}

export interface Response {
  token: string
  user: User
}

export default class AuthenticateCustomerMutation extends Relay.Mutation<Props, Response> {

  getMutation () {
    return Relay.QL`mutation{authenticateCustomer}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on AuthenticateCustomerPayload {
        token # this is not needed but may not be empty
      }
    `
  }

  getConfigs () {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on AuthenticateCustomerPayload {
          token
          user {
            id
            createdAt
            crm {
              information {
                source
              }
            }
          }
        }
      `],
    }]
  }

  getVariables () {
    return {
      auth0IdToken: this.props.auth0IdToken,
    }
  }
}
