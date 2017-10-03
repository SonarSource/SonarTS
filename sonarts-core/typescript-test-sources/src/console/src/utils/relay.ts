import {injectNetworkLayer, DefaultNetworkLayer, Transaction} from 'react-relay'
import {ShowNotificationCallback} from '../types/utils'
import * as cookiestore from 'cookiestore'
import {Lokka} from 'lokka'
import {Transport} from 'lokka-transport-http'
import {toGQL} from '../views/models/utils'
import {isScalar, isNonScalarList} from './graphql'
import {Field, OrderBy} from '../types/types'
import {TypedValue} from '../types/utils'

export function updateNetworkLayer (): void {
  try {
    const isLoggedin = cookiestore.has('graphcool_auth_token') && cookiestore.has('graphcool_customer_id')
    const headers = isLoggedin
      ? {
        'Authorization': `Bearer ${cookiestore.get('graphcool_auth_token')}`,
      }
      : null
    const api = `${__BACKEND_ADDR__}/system`
    const layer = new DefaultNetworkLayer(api, { headers, retryDelays: [] })

    injectNetworkLayer(layer)
  } catch (e) {
    console.error(e)
  }
}

export function onFailureShowNotification (
  transaction: Transaction,
  showNotification: ShowNotificationCallback,
): void {
  const error = transaction.getError() as any
  // NOTE if error returns non-200 response, there is no `source` provided (probably because of fetch)
  if (typeof Raven !== 'undefined') {
    Raven.captureException(error, {
      tags: {url: location.pathname},
    })
  }
  if (error.source && error.source.errors) {
    return error.source.errors
      .map(error => ({message: error.message, level: 'error'}))
      .forEach(notification => showNotification(notification))
  } else {
    console.error(error)
  }
}

export function getLokka(projectId: string): any {
  const clientEndpoint = `${__BACKEND_ADDR__}/relay/v1/${projectId}`
  const token = cookiestore.get('graphcool_auth_token')
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-graphcool-source': 'console:databrowser',
  }
  const transport = new Transport(clientEndpoint, { headers })
  return new Lokka({transport})
}

function camelCase(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1)
}

function getInputString(fieldValues: {[key: string]: any}): string {
  return fieldValues
    .mapToArray((fieldName, obj) => obj)
    .filter(({value}) => value !== null)
    .filter(({field}) => !field.isReadonly)
    .filter(({field}) => (!isNonScalarList(field)))
    .map(({field, value}) => toGQL(value, field))
    .join(' ')
}

function getAddMutation(modelName: string, fieldValues: {[key: string]: any}, fields: Field[]) {
  const inputString = getInputString(fieldValues)

  const inputArgumentsString = `(input: {${inputString} clientMutationId: "a"})`

  const fieldNames = getFieldsProjection(fields)

  return `
    create${modelName}${inputArgumentsString} {
      ${camelCase(modelName)} {
        ${fieldNames}
      }
    }
  `
}

export function addNode(
  lokka: any,
  modelName: string,
  fieldValues: { [key: string]: any },
  fields: Field[],
): Promise<any> {

  const mutation = `
    {
      ${getAddMutation(modelName, fieldValues, fields)}
    }
  `
  return lokka.mutate(mutation)
}

export function addNodes(
  lokka: any,
  modelName: string,
  fieldValueArray: {[key: string]: any}[],
  fields: Field[],
): Promise<any> {
  const mutations = fieldValueArray.map((value, index) => `add${index}: ${getAddMutation(modelName, value, fields)}`)
  return lokka.mutate(`{${mutations.join('\n')}}`)
}

export function updateNode(lokka: any, modelName: string, value: TypedValue,
                           field: Field, nodeId: string): Promise<any> {
  const mutation = `
    {
      update${modelName}(
        input: {
          id: "${nodeId}"
          clientMutationId: "a"
          ${toGQL(value, field)}
        }
      ) {
        ${camelCase(modelName)} {
          id
        }
      }
    }
  `
  return lokka.mutate(mutation)
}

export function deleteNode(lokka: any, modelName: string, nodeId: string): Promise<any> {
  const mutation = `
    {
      delete${modelName}(
        input: {
          id: "${nodeId}"
          clientMutationId: "a"
        }
      ) {
        deletedId
      }
    }
  `
  return lokka.mutate(mutation)
}

function getFieldsProjection(fields: Field[], subNodeLimit: number = 3) {
  return fields
    .map((field) => isScalar(field.typeIdentifier)
      ? field.name : field.isList
      ? `${field.name} (first: ${subNodeLimit}) { edges { node { id } } }`
      : `${field.name} { id }`)
    .join(' ')
}

function addSlashes( str ) {
  return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')
}

export function queryNodes(
  lokka: any,
  modelNamePlural: string,
  fields: Field[],
  skip: number = 0,
  first: number = 50,
  searchQuery: string,
  orderBy?: OrderBy,
  subNodeLimit: number = 3,
): Promise<any> {

  const fieldNames = getFieldsProjection(fields, subNodeLimit)

  let filterQuery = ''

  const isNumber = !isNaN(parseFloat(searchQuery))

  const numberTypes = ['Int', 'Float']
  const stringTypes = ['String', 'GraphQLID']

  if (searchQuery.length > 0) {
    filterQuery = fields
      .filter(field => {
        const identifier = field.typeIdentifier

        if (field.isList) {
          return false
        }

        if (isNumber) {
          return numberTypes.concat(stringTypes).includes(identifier)
        }

        return stringTypes.includes(identifier)
      })
      .map(field => {
        const fieldName = field.name
        const identifier = field.typeIdentifier

        const sanitized = addSlashes(searchQuery)

        if (numberTypes.includes(identifier)) {
          return `${fieldName}: ${sanitized}`
        }

        return `${fieldName}_contains: "${sanitized}"`
      })
      .map(query => {
        return `{ ${query} }`
      })
      .join(', ')

    filterQuery = `OR: [${filterQuery}]`
  }

  const filter = filterQuery !== '' ? `filter: { ${filterQuery} }` : ''
  const orderByQuery = orderBy ? `orderBy: ${orderBy.fieldName}_${orderBy.order}` : ''
  const query = `
    {
      viewer {
        all${modelNamePlural}(first: ${first} skip: ${skip} ${filter} ${orderByQuery}) {
          edges {
            node {
              ${fieldNames}
            }
          }
          count
        }
      }
    }
  `
  return lokka.query(query)
}
