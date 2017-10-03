import * as Relay from 'react-relay'
import {FunctionBinding, FunctionType} from '../../types/types'
import {pick} from 'lodash'

interface Props {
  isActive: boolean
  functionId?: string
}

export default class ToggleActiveRequestPipelineMutationFunction extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{updateRequestPipelineMutationFunction}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateRequestPipelineMutationFunctionPayload {
        function
        project
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        function: this.props.functionId,
      },
    }]
  }

  getVariables () {
    return pick(this.props, [
      'isActive', 'functionId',
    ])
  }
}
