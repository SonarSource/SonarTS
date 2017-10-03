import * as Relay from 'react-relay'
import {} from '../types/gettingStarted'

interface Props {
  customerInformationId: string
  name?: string
  email?: string
}

export default class UpdateCustomerInformationMutation extends Relay.Mutation<Props, {}> {

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
      name: this.props.name,
      email: this.props.email,
    }
  }

  getOptimisticResponse () {
    return {
      customerInformation: {
        id: this.props.customerInformationId,
        name: this.props.name,
        email: this.props.email,
      },
    }
  }
}
