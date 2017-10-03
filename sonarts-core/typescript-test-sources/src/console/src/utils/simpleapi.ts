import {Field, OrderBy} from '../types/types'
import * as Immutable from 'immutable'
import {isScalar} from './graphql'
import * as cookiestore from 'cookiestore'
import { Lokka } from 'lokka'
import { Transport } from 'lokka-transport-http'

export function getLokka(projectId: string): any {
  const clientEndpoint = `${__BACKEND_ADDR__}/simple/v1/${projectId}`
  const token = cookiestore.get('graphcool_auth_token')
  const headers = { Authorization: `Bearer ${token}` }
  const transport = new Transport(clientEndpoint, { headers })
  return new Lokka({transport})
}

export function queryNodes(lokka: any, modelNamePlural: string, fields: Field[], skip: number = 0, first: number = 50,
                           filters: Immutable.Map<string, any> = Immutable.Map<string, any>(),
                           orderBy?: OrderBy): Promise<any> {

  const fieldNames = fields
    .map((field) => isScalar(field.typeIdentifier) ? field.name : `${field.name} { id }`)
    .join(' ')

  const filterQuery = filters
    .filter((v) => v !== null)
    .map((value, fieldName) => `${fieldName}: ${value}`)
    .join(' ')

  const filter = filterQuery !== '' ? `filter: { ${filterQuery} }` : ''
  const orderByQuery = orderBy ? `orderBy: ${orderBy.fieldName}_${orderBy.order}` : ''
  const query = `
    {
      all${modelNamePlural}(first: ${first} skip: ${skip} ${filter} ${orderByQuery}) {
        ${fieldNames}
      }
    }
  `
  return lokka.query(query)
}
