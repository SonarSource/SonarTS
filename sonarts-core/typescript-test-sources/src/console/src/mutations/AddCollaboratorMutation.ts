import * as Relay from 'react-relay'

interface Props {
  projectId: string
  email: string
}

export default class AddCollaboratorMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{inviteCollaborator}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on InviteCollaboratorPayload {
        project
        seat {
          email
        }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'RANGE_ADD',
      parentName: 'project',
      parentID: this.props.projectId,
      connectionName: 'seats',
      edgeName: 'seatEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }]
  }

  getVariables () {
    return {
      projectId: this.props.projectId,
      email: this.props.email,
    }
  }
}
