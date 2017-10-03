import * as Relay from 'react-relay'
import {} from '../types/gettingStarted'

interface Props {
  customerInformationId: string
  source: string
  referral: string
}

export default class UpdateCustomerSourceMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{updateCrmCustomerInformation}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateCrmCustomerInformationPayload {
        customerInformation
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        customerInformation: this.props.customerInformationId,
      },
    }]
  }

  getVariables () {
    return {
      source: this.props.source,
      referral: this.props.referral,
    }
  }

  getOptimisticResponse () {
    return {
      customerInformation: {
        id: this.props.customerInformationId,
        source: this.props.source,
        referral: this.props.referral,
      },
    }
  }
}
