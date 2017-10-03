import * as Relay from 'react-relay'

interface Props {
  customerId: string
  oldPassword: string
  newPassword: string
}

export default class UpdatePasswordMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{updatePassword}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdatePasswordPayload {
        user
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        user: this.props.customerId,
      },
    }]
  }

  getVariables () {
    return {
      oldPassword: this.props.oldPassword,
      newPassword: this.props.newPassword,
    }
  }

  getOptimisticResponse () {
    return {
      user: {
        id: this.props.customerId,
        oldPassword: this.props.oldPassword,
        newPassword: this.props.newPassword,
      },
    }
  }
}
