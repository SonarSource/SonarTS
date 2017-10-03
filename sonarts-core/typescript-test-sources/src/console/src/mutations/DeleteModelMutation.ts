import * as Relay from 'react-relay'
import {Field, RelayConnection} from '../types/types'
import {isScalar} from '../utils/graphql'

interface Props {
  modelId: string
  projectId: string
}

export interface RelationData {
  relatedModelId: string
  reverseRelationFieldId: string
}

export default class DeleteModelMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{deleteModel}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DeleteModelPayload {
        project
        deletedId
        deletedRelationFieldIds
      }
    `
  }

  getConfigs () {
    const modelDelete = {
      type: 'NODE_DELETE',
      parentName: 'project',
      parentID: this.props.projectId,
      connectionName: 'models',
      deletedIDFieldName: 'deletedId',
    }

    const deletedRelationFields = {
      type: 'NODE_DELETE',
      parentName: 'project',
      parentID: this.props.projectId,
      connectionName: 'fields',
      deletedIDFieldName: 'deletedRelationFieldIds',
    }

    return [modelDelete, deletedRelationFields]
  }

  getVariables () {
    return {
      modelId: this.props.modelId,
    }
  }

  getOptimisticResponse () {
    return {
      deletedId: this.props.modelId,
    }
  }
}
