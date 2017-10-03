import {ReduxAction} from '../types/reducers'
import Constants from '../constants/codeGeneration'
import {Environment, GraphQLClient} from '../types/types'

interface CodeGenerationState {
  environment: Environment
  client: GraphQLClient
}

const initialState: CodeGenerationState = {
  environment: 'Node',
  client: 'lokka',
}

export function reduceCodeGeneration(
  state: CodeGenerationState = initialState,
  action: ReduxAction,
): CodeGenerationState {
  switch (action.type) {
    case Constants.SET_CODE_GENERATION_CLIENT:
      return Object.assign({}, state, {
        client: action.payload,
      })
    case Constants.SET_CODE_GENERATION_ENVIRONMENT:
      return Object.assign({}, state, {
        environment: action.payload,
      })
    default:
      return state
  }
}
