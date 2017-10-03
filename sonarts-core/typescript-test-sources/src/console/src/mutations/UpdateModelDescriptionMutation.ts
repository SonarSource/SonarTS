import * as Relay from 'react-relay'

interface Props {
  modelId: string
  description: string
}

export default class UpdateModelDescriptionMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{updateModel}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateModelPayload {
        model
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        model: this.props.modelId,
      },
    }]
  }

  getVariables () {
    return {
      id: this.props.modelId,
      description: this.props.description,
    }
  }

  getOptimisticResponse () {
    return {
      model: {
        id: this.props.modelId,
        description: this.props.description,
      },
    }
  }
}
