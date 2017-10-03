import * as Relay from 'react-relay'

interface Props {
  projectId: string
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

export default class AddRelationMutation extends Relay.Mutation<Props, {}> {

    getMutation () {
        return Relay.QL`mutation{addRelation}`
    }

    getFatQuery () {
        return Relay.QL`
            fragment on AddRelationPayload {
                relation
                leftModel
                rightModel
                project
            }
        `
    }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'project',
      parentID: this.props.projectId,
      connectionName: 'relations',
      edgeName: 'relationEdge',
      rangeBehaviors: {'': 'append'},
    }, {
      type: 'RANGE_ADD',
      parentName: 'leftModel',
      parentID: this.props.leftModelId,
      connectionName: 'fields',
      edgeName: 'fieldOnLeftModelEdge',
      rangeBehaviors: {'': 'append'},
    }, {
      type: 'RANGE_ADD',
      parentName: 'rightModel',
      parentID: this.props.rightModelId,
      connectionName: 'fields',
      edgeName: 'fieldOnRightModelEdge',
      rangeBehaviors: {'': 'append'},
    }]
  }

  getVariables() {
    return this.props
  }
}
