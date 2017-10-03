import * as Relay from 'react-relay'

interface Props {
  fieldId: string
  isUnique: boolean
}

export default class UpdateFieldIsUniqueMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{updateField}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateFieldPayload {
        field
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        field: this.props.fieldId,
      },
    }]
  }

  getVariables () {
    return {
      id: this.props.fieldId,
      isUnique: this.props.isUnique,
    }
  }

  getOptimisticResponse () {
    return {
      field: {
        id: this.props.fieldId,
        isUnique: this.props.isUnique,
      },
    }
  }
}
