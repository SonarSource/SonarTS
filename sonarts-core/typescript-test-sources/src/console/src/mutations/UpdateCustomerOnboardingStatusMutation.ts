import * as Relay from 'react-relay'
import {Step} from '../types/gettingStarted'
import {Example} from '../types/types'

interface Props {
  onboardingStatusId: string
  gettingStarted: Step
  gettingStartedSkipped: boolean
  gettingStartedCompleted: boolean
  gettingStartedExample: Example
}

export default class UpdateCustomerOnboardingStatusMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{updateCrmOnboardingStatus}`
  }

  getFatQuery () {
    // TODO don't know why I have to specify so much otherwise it thinks that onboardingStatus is a user
    return Relay.QL`
      fragment on UpdateCrmOnboardingStatusPayload {
        onboardingStatus {
          id
          gettingStarted
          gettingStartedExample
          systemBridge
          gettingStartedSkipped
          gettingStartedCompleted
          
        }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        onboardingStatus: this.props.onboardingStatusId,
      },
    }]
  }

  getVariables () {
    return {
      gettingStarted: this.props.gettingStarted,
      gettingStartedSkipped: this.props.gettingStartedSkipped,
      gettingStartedCompleted: this.props.gettingStartedCompleted,
      gettingStartedExample: this.props.gettingStartedExample,
    }
  }

  getOptimisticResponse () {
    return {
      onboardingStatus: {
        id: this.props.onboardingStatusId,
        gettingStarted: this.props.gettingStarted,
        gettingStartedSkipped: this.props.gettingStartedSkipped,
        gettingStartedCompleted: this.props.gettingStartedCompleted,
      },
    }
  }
}
