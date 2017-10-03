import * as Relay from 'react-relay'

export interface UpdateFieldProps {
  id: string
  name: string
  typeIdentifier?: string
  enumValues: string[]
  isRequired: boolean
  isList: boolean
  isUnique: boolean
  defaultValue?: string
  relationId?: string
  migrationValue?: string
  description?: string
  enumId?: string
}

export default class UpdateFieldMutation extends Relay.Mutation<UpdateFieldProps, {}> {

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
        field: this.props.id,
      },
    }]
  }

  getVariables () {
    return {
      id: this.props.id,
      name: this.props.name,
      typeIdentifier: this.props.typeIdentifier,
      enumValues: this.props.enumValues,
      isRequired: this.props.isRequired,
      isList: this.props.isList,
      isUnique: this.props.isUnique,
      defaultValue: this.props.defaultValue,
      relationId: this.props.relationId,
      migrationValue: this.props.migrationValue,
      description: this.props.description,
      enumId: this.props.enumId,
    }
  }

  getOptimisticResponse () {
    return {
      field: {
        id: this.props.id,
        name: this.props.name,
        typeIdentifier: this.props.typeIdentifier,
        enumValues: this.props.enumValues,
        isRequired: this.props.isRequired,
        isList: this.props.isList,
        isUnique: this.props.isUnique,
        defaultValue: this.props.defaultValue,
        description: this.props.description || null,
        enumId: this.props.enumId,
      },
    }
  }
}
