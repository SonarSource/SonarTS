import {Environment, GraphQLClient} from '../types/types'
import Constants from '../constants/codeGeneration'
import tracker from '../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'

export const setEnvironment = (env: Environment) => {
  tracker.track(ConsoleEvents.Playground.CodeGenerationPopup.environmentSelected({env}))
  return {
    type: Constants.SET_CODE_GENERATION_ENVIRONMENT,
    payload: env,
  }
}

export const setClient = (client: GraphQLClient) => {
  tracker.track(ConsoleEvents.Playground.CodeGenerationPopup.clientSelected({client}))
  return {
    type: Constants.SET_CODE_GENERATION_CLIENT,
    payload: client,
  }
}
