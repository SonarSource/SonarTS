import * as Relay from 'react-relay'

interface Props {
  clientUserId: string
  projectId: string
}

interface Response {
  token: string
}

export default class LoginMutation extends Relay.Mutation<Props, Response> {

  getMutation () {
    return Relay.QL`mutation{signinClientUser}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on SigninClientUserPayload {
        token
      }
    `
  }

  getConfigs () {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on SigninClientUserPayload {
          token
        }
      `],
    }]
  }

  getVariables () {
    return {
      clientUserId: this.props.clientUserId,
      projectId: this.props.projectId,
    }
  }
}
