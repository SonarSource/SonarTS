import {FunctionBinding, Model, RequestPipelineMutationOperation, ServerlessFunction} from '../../../types/types'
import {EventType, FunctionPopupState} from './FunctionPopup'
import {keysChanged} from '../../../utils/change'
export function getEmptyFunction(models: Model[], functions: ServerlessFunction[], eventType: EventType):
 ServerlessFunction {
  const modelId = models[0].id

  const bindings: FunctionBinding[] = ['TRANSFORM_ARGUMENT', 'PRE_WRITE', 'TRANSFORM_PAYLOAD']
  // TODO continue when backend is ready
  // const takenBindings = bindings
  //   .map(binding => bindingTaken(modelId, binding, functions))
  //
  // let binding
  //
  // if (takenBindings[0] && takenBindings[1] && takenBindings[2]) {
  //   binding = undefined
  // } else if (!takenBindings[0]) {
  //   binding = 'TRANSFORM_ARGUMENT'
  // } else if (!takenBindings[1]) {
  //   binding = 'PRE_WRITE'
  // } else if (!takenBindings[2]) {
  //   binding = 'TRANSFORM_PAYLOAD'
  // }

  const binding = 'TRANSFORM_ARGUMENT'

  return {
    id: '',
    name: '',
    type: 'AUTH0',
    webhookUrl: '',
    webhookHeaders: '',
    _webhookHeaders: {
      'Content-Type': 'application/json',
    },
    inlineCode: inlineCode(eventType),
    auth0Id: '',
    logs: {
      edges: [],
    },
    binding,
    operation: 'CREATE',
    stats: undefined,
    isActive: true,
    modelId,
    query: getDefaultSSSQuery(models[0].name),
  }
}

export function getDefaultSSSQuery(modelName: string) {
  return `\
subscription {
  ${modelName}(filter: {
    mutation_in: [CREATED, UPDATED, DELETED]
  }) {
    updatedFields
    node {
      id
    }
  }
}`
}

export function bindingTaken(modelId: string, binding: FunctionBinding, functions: ServerlessFunction[]) {
  return functions.filter(fn => fn.model.id === modelId && fn.binding === binding)
}

export const inlineCode = (eventType: EventType) => {
  if (eventType === 'SSS') {
    return `\
// Click "EXAMPLE EVENT" to see whats in \`event\`
module.exports = function (event, log) {
  log('Received event')
  log(event.data)
}
`
  }
  return `\
// Click "EXAMPLE EVENT" to see whats in \`event\`
module.exports = function (event, log, cb) {
  log(event.data)  
  return {data: event.data}
}
`
}

export function updateInlineCode(state: ServerlessFunction, inlineCode: string): ServerlessFunction {
  return {
    ...state,
    inlineCode,
  }
}

export function updateName(state: ServerlessFunction, name: string): ServerlessFunction {
  return {
    ...state,
    name,
  }
}

export function updateBinding(state: ServerlessFunction, binding: FunctionBinding): ServerlessFunction {
  return {
    ...state,
    binding,
  }
}

export function updateModel(state: ServerlessFunction, modelId: string): ServerlessFunction {
  return {
    ...state,
    modelId,
  }
}

export function updateAuth0Id(state: ServerlessFunction, auth0Id: string): ServerlessFunction {
  return {
    ...state,
    auth0Id,
  }
}

export function updateOperation(
  state: ServerlessFunction,
  operation: RequestPipelineMutationOperation,
): ServerlessFunction {
  return {
    ...state,
    operation,
  }
}

export function updateWebhookUrl(state: ServerlessFunction, webhookUrl: string): ServerlessFunction {
  return {
    ...state,
    webhookUrl,
  }
}

export function updateWebhookHeaders(state: ServerlessFunction, _webhookHeaders: {[key: string]: string}):
ServerlessFunction {
  return {
    ...state,
    _webhookHeaders,
  }
}

export function updateQuery(state: ServerlessFunction, query: string): ServerlessFunction {
  return {
    ...state,
    query,
  }
}

export function isValid(state: FunctionPopupState) {
  if (!state.fn.webhookUrl && !state.fn.inlineCode) {
    return false
  }
  return true
}

export function didChange(after: ServerlessFunction, before?: ServerlessFunction) {
  if (!before) {
    return true
  }
  return keysChanged(before, after, [
    'name', 'isActive', 'binding', 'operation',
    'type', 'url', 'headers', 'inlineCode', 'auth0Id', 'query',
  ]) || JSON.stringify(after._webhookHeaders) !== before.webhookHeaders
}
