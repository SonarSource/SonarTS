import * as Relay from 'react-relay'

interface Props {
  relationId: string
  name: string
  description?: string
  leftModelId: string
  rightModelId: string
  fieldOnLeftModelName: string
  fieldOnRightModelName: string
  fieldOnLeftModelIsList: boolean
  fieldOnRightModelIsList: boolean
  fieldOnLeftModelIsRequired: boolean
  fieldOnRightModelIsRequired: boolean
}

interface Response {
}

export default class UpdateRelationMutation extends Relay.Mutation<Props, Response> {

  getMutation () {
    return Relay.QL`mutation{updateRelation}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateRelationPayload {
        relation
        project
      }
    `
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        relation: this.props.relationId,
      },
    }]
  }

  getVariables() {
    return this.getRelation()
  }

  getOptimisticResponse() {
    return {
      relation: this.getRelation.filterNullAndUndefined(),
    }
  }

  private getRelation = () => {
    return {
      id: this.props.relationId,
      name: this.props.name,
      description: this.props.description,
      leftModelId: this.props.leftModelId,
      rightModelId: this.props.rightModelId,
      fieldOnLeftModelName: this.props.fieldOnLeftModelName,
      fieldOnRightModelName: this.props.fieldOnRightModelName,
      fieldOnLeftModelIsList: this.props.fieldOnLeftModelIsList,
      fieldOnRightModelIsList: this.props.fieldOnRightModelIsList,
      fieldOnLeftModelIsRequired: this.props.fieldOnLeftModelIsRequired,
      fieldOnRightModelIsRequired: this.props.fieldOnRightModelIsRequired,
    }
  }
}
