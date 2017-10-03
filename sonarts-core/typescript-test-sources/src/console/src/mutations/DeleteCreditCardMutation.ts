import * as Relay from 'react-relay'

interface Props {
  projectId: string
}

export default class DeleteCreditCardMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{deleteCreditCard}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DeleteCreditCardPayload {
        user {
          name
        }
      }
    `
  }

  getConfigs () {
    return [
      // type: 'RANGE_ADD',
      // parentName: 'project',
      // parentID: this.props.projectId,
      // connectionName: 'seats',
      // edgeName: 'seatEdge',
      // rangeBehaviors: {
      //   '': 'append',
      // },
    ]
  }

  getVariables () {
    return {
      projectId: this.props.projectId,
    }
  }
}
