import * as Relay from 'react-relay'

interface Props {
  modelId: string
  name: string
}

export default class UpdateModelNameMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{updateModel}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateModelPayload {
        model
        project
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
      name: this.props.name,
    }
  }

  getOptimisticResponse () {
    return {
      model: {
        id: this.props.modelId,
        name: this.props.name,
      },
    }
  }
}
