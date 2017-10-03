import {ReduxAction, ReduxThunk, Dispatch} from '../../types/reducers'
import {TypedValue, NonScalarValue} from '../../types/utils'
import {OrderBy, Field, Model} from '../../types/types'
import {StateTree} from '../../types/reducers'
import Constants from '../../constants/databrowser/data'
import * as Immutable from 'immutable'
import {addNode as addRelayNode, queryNodes, updateNode as updateRelayNode, deleteNode} from '../../utils/relay'
import {hideNewRow, setLoading, clearNodeSelection} from './ui'
import {showDonePopup, nextStep} from '../gettingStarted'
import {showNotification} from '../notification'
import {isNonScalarList, isScalar} from '../../utils/graphql'
import {sideNavSyncer} from '../../utils/sideNavSyncer'
import * as bluebird from 'bluebird'
import {GridPosition} from '../../types/databrowser/ui'
import {toggleNewRow} from '../../actions/databrowser/ui'
import tracker from '../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'
import {unionBy} from 'lodash'
import Any = jasmine.Any

export function setItemCount(count: number) {
  return {
    type: Constants.SET_ITEMCOUNT,
    payload: count,
  }
}

export function increaseCountChange(modelName: string) {
  return {
    type: Constants.INCREASE_COUNT_CHANGE,
    payload: modelName,
  }
}

export function decreaseCountChange(modelName: string) {
  return {
    type: Constants.DECREASE_COUNT_CHANGE,
    payload: modelName,
  }
}

export const setNewRowShown = () => ({
  type: Constants.SET_NEW_ROW_SHOWN,
})

export function setOrder(orderBy: OrderBy): ReduxAction {
  return {
    type: Constants.SET_ORDER,
    payload: orderBy,
  }
}

export function setData(nodes: Immutable.List<Immutable.Map<string, any>>, loaded: Immutable.List<boolean>) {
  return {
    type: Constants.SET_DATA,
    payload: {
      nodes,
      loaded,
    },
  }
}

export function reloadDataAsync(lokka: any,
                                modelNamePlural: string,
                                fields: Field[],
                                index: number = 0,
                                searchQuery: string = ''): ReduxThunk {
  return (dispatch: Dispatch, getState: () => StateTree): Promise<{}> => {
    dispatch(setData(Immutable.List<Immutable.Map<string, any>>(), Immutable.List<boolean>()))
    return dispatch(loadDataAsync(lokka, modelNamePlural, fields, index, 100, searchQuery))
      .then(() => {
        sideNavSyncer.notifySideNav()
        dispatch(setLoading(false))
      })
  }
}

let lastModelNamePlural = null

function cleanServerData(node, fields) {
  fields.filter((field) => isNonScalarList(field))
    .forEach(({name}) => node[name] = node[name].edges.map(({node}) => node))
  return node
}

export function loadDataAsync(lokka: any,
                              modelNamePlural: string,
                              fields: Field[],
                              skip: number,
                              first: number,
                              searchQuery: string = ''): ReduxThunk {
  return (dispatch: Dispatch, getState: () => StateTree): Promise<{}> => {
    const {data} = getState().databrowser
    // as we have optimistic ui updates, they trigger an unwanted reload to the InfiniteLoader
    // so disable loading while doing the mutations
    if (data.mutationActive) {
      return Promise.reject({})
    }
    lastModelNamePlural = modelNamePlural
    return queryNodes(lokka, modelNamePlural, fields, skip, first, searchQuery, data.orderBy)
      .then(results => {
        const newNodes = results.viewer[`all${modelNamePlural}`]
          .edges.map(({node}) => {
            // Transforms the relay query into something that the valueparser understands
            // Previously we used the simple API that's why this is necessary
            return cleanServerData(node, fields)
          }).map(Immutable.Map)

        let nodes = data.nodes
        let loaded = data.loaded
        for (let index = 0; index < newNodes.length; index++) {
          nodes = nodes.set(skip + index, newNodes[index])
          loaded = loaded.set(skip + index, true)
        }

        if (lastModelNamePlural !== modelNamePlural) {
          return
        }
        dispatch(setLoading(false))
        dispatch(resetCountChange())
        dispatch(setItemCount(results.viewer[`all${modelNamePlural}`].count))
        dispatch(setData(nodes, loaded))
        // conditions to show the new row active
        // 1. needs to be the first time the following conditions are true
        // 2. node list is empty
        // 3. search term is empty, too
        if (nodes.size === 0 && searchQuery.length === 0 && !getState().databrowser.data.newRowShown) {
          dispatch(toggleNewRow(fields, modelNamePlural))
        }
      })
      .catch((err) => {
        if (err.rawError) {
          err.rawError.forEach(error => dispatch(showNotification({message: error.message, level: 'error'})))
        } else {
          dispatch(showNotification({message: err.message, level: 'error'}))
        }
      })
  }
}

export function addNodeAsync(lokka: any, model: Model, fields: Field[], fieldValues: { [key: string]: any }): ReduxThunk { // tslint:disable-line
  return (dispatch: Dispatch, getState: () => StateTree): Promise<{}> => {
    dispatch(mutationRequest())

    dispatch(hideNewRow())

    const values = Object.keys(fieldValues).mapToObject(key => key, key => fieldValues[key].value)

    dispatch(addNodeRequest(Immutable.Map<string, any>(values)))
    dispatch(increaseCountChange(model.id))

    return addRelayNode(lokka, model.name, fieldValues, fields)
      .then(res => {
        let node = res[`create${model.name}`][lowercaseFirstLetter(model.name)]
        node = cleanServerData(node, fields)
        dispatch(addNodeSuccess(Immutable.Map<string,any>(node)))
        dispatch(mutationSuccess())

        // const {gettingStartedState} = getState().gettingStarted
        // if (model.name === 'Post' && (
        //     gettingStartedState.isCurrentStep('STEP3_CLICK_ENTER_DESCRIPTION') ||
        //     gettingStartedState.isCurrentStep('STEP3_CLICK_ADD_NODE1') ||
        //     gettingStartedState.isCurrentStep('STEP3_CLICK_SAVE_NODE1') ||
        //     gettingStartedState.isCurrentStep('STEP3_CLICK_ADD_NODE2')
        //   )) {
        //   dispatch(showDonePopup())
        //   dispatch(nextStep())
        // }
      })
      .catch((err) => {
        console.error(err)
        dispatch(mutationError())
        dispatch(decreaseCountChange(model.id))
        if (err.rawError) {
          err.rawError.forEach(error => dispatch(showNotification({message: error.message, level: 'error'})))
        }
      })
  }
}

export function updateNodeAsync(lokka: any,
                                model: Model,
                                fields: Field[],
                                value: TypedValue,
                                field: Field,
                                callback,
                                nodeId: string,
                                rowIndex: number): ReduxThunk {
  return (dispatch: Dispatch, getState: () => StateTree): Promise<{}> => {

    if (field.isReadonly) {
      return Promise.reject({})
    }
    dispatch(mutationRequest())

    // if relation to self
    if (!isScalar(field.typeIdentifier) && field.relatedModel.id === field.model.id) {
      const {nodes} = getState().databrowser.data

      const node = nodes.find(n => n.get('id') === nodeId)
      // the list case doesn't need to be implemented, because that's handled in the RelationsPopup
      let reference = value as NonScalarValue
      if (reference) {
        const refId = reference.id
        const relatedNode = nodes.find(n => n.get('id') === refId)
        if (relatedNode) {
          addBackReferenceFromRelatedNode(node, relatedNode, field, dispatch, getState)
        }
      } else {
        reference = node.get(field.name)
        const refId = reference.id
        const relatedNode = nodes.find(n => n.get('id') === refId)
        if (relatedNode) {
          removeBackReferenceFromRelatedNode(node, relatedNode, field, dispatch, getState)
        }
      }
    }

    // the order here is VERY IMPORTANT
    // first we need to update the references fields, then we can update the field itself
    // in the case, that an optional reference goes from id x to null, the node with id x
    // needs to be updated
    dispatch(updateCell({
      position: {
        row: rowIndex,
        field: field.name,
      },
      value,
    }))
    return updateRelayNode(lokka, model.name, value, field, nodeId)
      .then((res) => {
        dispatch(mutationSuccess())
        callback(true)
      })
      .catch((err) => {
        dispatch(mutationError())
        callback(false)
        err.rawError.forEach((error) => dispatch(showNotification({message: error.message, level: 'error'})))
      })
  }
}

function lowercaseFirstLetter(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

function removeBackReferenceFromRelatedNode(originNode: Immutable.Map<string, any>,
                                            relatedNode: Immutable.Map<string, any>,
                                            originField: Field,
                                            dispatch: Dispatch,
                                            getState: () => StateTree) {
  const {nodes} = getState().databrowser.data
  const relatedNodeRowIndex = nodes.indexOf(relatedNode)
  const {reverseRelationField} = originField

  const position = {
    row: relatedNodeRowIndex,
    field: reverseRelationField.name,
  } as GridPosition

  let value
  if (reverseRelationField.isList) {
    const oldValues = relatedNode.get(reverseRelationField.name)
    value = oldValues.filter(ref => ref.id !== originNode.get('id'))
  } else {
    value = null
  }

  dispatch(updateCell({
    position, value,
  }))
}

function addBackReferenceFromRelatedNode(originNode: Immutable.Map<string, any>,
                                         relatedNode: Immutable.Map<string, any>,
                                         originField: Field,
                                         dispatch: Dispatch,
                                         getState: () => StateTree) {
  const {nodes} = getState().databrowser.data
  const relatedNodeRowIndex = nodes.indexOf(relatedNode)
  const {reverseRelationField} = originField

  const position = {
    row: relatedNodeRowIndex,
    field: reverseRelationField.name,
  } as GridPosition

  let value
  const originNodeId = originNode.get('id')
  if (reverseRelationField.isList) {
    const oldValues = relatedNode.get(reverseRelationField.name)
    value = unionBy(oldValues, [{id: originNodeId}], ref => ref.id)
  } else {
    value = {id: originNodeId}
  }

  dispatch(updateCell({
    position, value,
  }))
}

export function deleteSelectedNodes(lokka: any, projectName: string, modelName: string, model: Model): ReduxThunk {
  return (dispatch, getState) => {
    const {selectedNodeIds} = getState().databrowser.ui
    const {nodes} = getState().databrowser.data
    const ids = selectedNodeIds.toArray()

    // update referenced nodes
    const fields = model.fields.edges.map(edge => edge.node)
    const relationFields = fields.filter(field => !isScalar(field.typeIdentifier))
    ids.forEach(id => {
      dispatch(decreaseCountChange(model.id))
      const node = nodes.find(n => n.get('id') === id)
      if (!node) {
        return
      }
      relationFields.forEach(relationField => {
        const value = node.get(relationField.name)
        // if there were no relations, we don't have to remove any
        if (value === null) {
          return
        }
        if (relationField.isList) {
          if (typeof value.forEach !== 'function') {
            return
          }
          value.forEach(ref => {
            // the id of the referenced node
            const refId = ref.id
            // if we remove the referenced node, there is no need to update it
            if (!ids.includes(refId)) {
              const relatedNode = nodes.find(n => n.get('id') === refId)
              if (relatedNode) {
                removeBackReferenceFromRelatedNode(node, relatedNode, relationField, dispatch, getState)
              }
            }
          })
        } else {
          // the id of the referenced node
          const refId = value.id
          if (!ids.includes(refId)) {
            const relatedNode = nodes.find(n => n.get('id') === refId)
            if (relatedNode) {
              removeBackReferenceFromRelatedNode(node, relatedNode, relationField, dispatch, getState)
            }
          }
        }
      })
    })

    dispatch(mutationRequest())
    dispatch(deleteNodes(ids))
    dispatch(clearNodeSelection())

    return bluebird.map(ids, id => deleteNode(lokka, modelName, id), {
      concurrency: 5,
    })
      .then(() => {
        tracker.track(ConsoleEvents.Databrowser.deleteNodesCompleted({count: ids.length}))

        dispatch(mutationSuccess())
      })
      .catch((err) => {
        dispatch(mutationError())
        for (let i = 0; i < ids.length; i++) {
          dispatch(increaseCountChange(model.id))
        }
        if (err.rawError) {
          err.rawError.forEach((error) => this.props.showNotification({message: error.message, level: 'error'}))
        }
      })

  }
}

export function updateCell(payload: {
  position: GridPosition,
  value: TypedValue,
}) {
  return {
    type: Constants.UPDATE_CELL,
    payload,
  }
}

export function mutationSuccess() {
  return {
    type: Constants.MUTATION_SUCCESS,
  }
}

export function mutationError() {
  return {
    type: Constants.MUTATION_ERROR,
  }
}

export function mutationRequest() {
  return {
    type: Constants.MUTATION_REQUEST,
  }
}

export function addNodeRequest(payload: Immutable.Map<string,any>) {
  return {
    type: Constants.ADD_NODE_REQUEST,
    payload,
  }
}

export function addNodeSuccess(payload: Immutable.Map<string,any>) {
  return {
    type: Constants.ADD_NODE_SUCCESS,
    payload,
  }
}

export function deleteNodes(payload: string[]) {
  return {
    type: Constants.DELETE_NODES,
    payload,
  }
}

const resetCountChange = () => ({
  type: Constants.RESET_COUNT_CHANGE,
})
