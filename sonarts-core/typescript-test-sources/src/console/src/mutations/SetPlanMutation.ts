
import * as Relay from 'react-relay'

interface Props {
  projectId: string
  plan: string
}

export default class SetPlanMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{setPlan}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on SetPlanPayload {
        viewer {
          user {
            crm {
              customer {
                projects(first: 1000) {
                  edges {
                    node {
                      projectBillingInformation {
                        plan
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `
  }

  getConfigs () {
    return []
    // return [{
    //   type: 'FIELDS_CHANGE',
    //   fieldIDs: {
    //     project: this.props.projectId,
    //   },
    // }]
  }

  getVariables () {
    return {
      projectId: this.props.projectId,
      plan: this.props.plan,
    }
  }
}
