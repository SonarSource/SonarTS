import * as Relay from 'react-relay'

interface Props {
  resetPasswordToken: string
  newPassword: string
}

interface Response {
  token: string
}

export default class ResetPasswordMutation extends Relay.Mutation<Props, Response> {

  getMutation () {
    return Relay.QL`mutation{resetPassword}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on ResetPasswordPayload {
        token
        user { id }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on ResetPasswordPayload {
          token
          user { id }
        }
      `],
    }]
  }

  getVariables () {
    return this.props
  }
}
