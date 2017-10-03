import * as Relay from 'react-relay'
import {Region} from '../types/types'

interface Props {
  projectName: string
  customerId: string
  region: Region
}

export default class AddProjectMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{addProject}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on AddProjectPayload {
        projectEdge
        user
      }
    `
  }

  getConfigs () {
    return [{
      type: 'RANGE_ADD',
      parentName: 'user',
      parentID: this.props.customerId,
      connectionName: 'projects',
      edgeName: 'projectEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }]
  }

  getVariables () {
    return {
      name: this.props.projectName,
      region: this.props.region,
    }
  }
}
