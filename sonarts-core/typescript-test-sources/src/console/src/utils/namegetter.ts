import {Model} from '../types/types'

export function getModelName(id: string, models: Model[]): string {
  return getModel(id, models).name
}

export function getModelNamePlural(id: string, models: Model[]): string {
  return getModel(id, models).namePlural
}

export function getModel(id: string, models: Model[]): Model {
  return models.find((node) => node.id === id)
}
