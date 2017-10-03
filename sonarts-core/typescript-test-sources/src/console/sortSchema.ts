import {Model} from './src/types/types'
import {parse} from 'graphql'
import {print} from 'graphql/language'

export function sortSchema(schema: string, models: Model[]) {
  const ast = parse(schema)

  const sortedDefinitions = ast.definitions.sort((a, b) => {
    const modelA = models.find(model => model.name === a.name.value)
    const modelB = models.find(model => model.name === b.name.value)

    if (!modelA || !modelB) {
      return 1
    }

    return modelA.id < modelB.id ? 1 : -1
  })

  return print({
    ...ast,
    definitions: sortedDefinitions,
  })
}
