import * as Relay from 'react-relay'

interface Props {
  fieldId: string
  modelId: string
}

export default class DeleteFieldMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{deleteField}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DeleteFieldPayload {
        model
        deletedId
      }
    `
  }

  getConfigs () {
    return [{
      type: 'NODE_DELETE',
      parentName: 'model',
      parentID: this.props.modelId,
      connectionName: 'fields',
      deletedIDFieldName: 'deletedId',
    }]
  }

  getVariables () {
    return {
      fieldId: this.props.fieldId,
    }
  }

  getOptimisticResponse () {
    return {
      deletedId: this.props.fieldId,
    }
  }
}
