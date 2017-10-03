import * as Relay from 'react-relay'

interface Props {
  relationId: string
  description: string
}

interface Response {
}

export default class UpdateRelationDescriptionMutation extends Relay.Mutation<Props, Response> {

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
      description: this.props.description,
    }
  }
}
