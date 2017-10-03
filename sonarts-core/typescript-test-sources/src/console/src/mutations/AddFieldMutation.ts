import * as Relay from 'react-relay'

interface Props {
  modelId: string
  name: string
  typeIdentifier: string
  enumValues: string[]
  isRequired: boolean
  isUnique: boolean
  isList: boolean
  defaultValue?: string
  relationId?: string
  migrationValue?: string
  description: string
  enumId?: string
}

export default class AddFieldMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{addField}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on AddFieldPayload {
        fieldEdge
        model
      }
    `
  }

  getConfigs () {
    return [{
      type: 'RANGE_ADD',
      parentName: 'model',
      parentID: this.props.modelId,
      connectionName: 'fields',
      edgeName: 'fieldEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }]
  }

  getVariables () {
    return {
      modelId: this.props.modelId,
      name: this.props.name,
      typeIdentifier: this.props.typeIdentifier,
      enumValues: this.props.enumValues,
      isRequired: this.props.isRequired,
      isList: this.props.isList,
      isUnique: this.props.isUnique,
      defaultValue: this.props.defaultValue,
      relationId: this.props.relationId,
      migrationValue: this.props.migrationValue,
      description: this.props.description || null,
      enumId: this.props.enumId || null,
    }
  }
}
