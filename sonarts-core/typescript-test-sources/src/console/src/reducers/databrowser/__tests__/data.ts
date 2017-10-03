import { reduceData, initialState } from '../data'
import {
  setOrder, setItemCount, setData, mutationRequest,
  addNodeRequest, mutationError, deleteNodes, mutationSuccess, updateCell, addNodeSuccess,
} from '../../../actions/databrowser/data'
import * as Immutable from 'immutable'
import {ReduxAction} from '../../../types/reducers'
import {DataBrowserDataState} from '../../../types/databrowser/data'
import {Reducer} from 'redux'

function mockNodes() {
  return setData(
    Immutable.List<Immutable.Map<string, any>>(
      [
        Immutable.Map({
          id: 'asd',
          name: 'a',
        }),
        Immutable.Map({
          id: 'asd2',
          name: 'a2',
        }),
        Immutable.Map({
          id: 'asd3',
          name: 'a3',
        }),
      ],
    ),
    Immutable.List<boolean>([true, true, true]),
  )
}

describe('databrowser reducer', () => {

  it('should render the initialState', () => {
    const state = reduceData(initialState, {type: null})
    expect(state).toMatchSnapshot()
  })

  it('should set the order', () => {
    const state = reduceData(initialState, setOrder({
      fieldName: 'name',
      order: 'ASC',
    }))

    expect(state).toMatchSnapshot()
  })

  it('should set the item count', () => {
    const state = reduceData(initialState, setItemCount(5))

    expect(state).toMatchSnapshot()
  })

  it('should set data', () => {
    const state = reduceData(initialState, mockNodes())

    expect(state).toMatchSnapshot()
  })

  it('should backup and restore nodes on create mutation request', () => {
    reduceAndSnapshot(initialState, reduceData, [
      mockNodes(),
      mutationRequest(),
      addNodeRequest(Immutable.Map({
        id: 'asd4',
        name: 'a4',
      })),
      mutationError(),
    ])
  })

  it('should be able to modify the created node after optimistic create', () => {
    reduceAndSnapshot(
      initialState,
      reduceData,
      [
        mockNodes(),
        mutationRequest(),
        addNodeRequest(Immutable.Map({
          name: 'a4',
        })),
        addNodeSuccess(Immutable.Map({
          id: 'asd4',
          name: 'a4',
        })),
      ],
      [0, 1],
    )
  })

  it('should backup and delete the backup when mutation success after delete mutation', () => {
    reduceAndSnapshot(
      initialState,
      reduceData,
      [
        mockNodes(),
        mutationRequest(),
        deleteNodes(['asd', 'asd2']),
        mutationSuccess(),
      ],
      [0, 1])
  })

  it('should backup and restore when mutation fail after delete mutation', () => {
    reduceAndSnapshot(
      initialState,
      reduceData,
      [
        mockNodes(),
        mutationRequest(),
        deleteNodes(['asd', 'asd2']),
        mutationError(),
      ],
      [0, 1],
    )
  })

  it('should execute the update cell action', () => {
    reduceAndSnapshot(initialState, reduceData, [
      mockNodes(),
      updateCell({
        position: {
          row: 0,
          field: 'name',
        },
        value: 'aaa',
      }),
    ])
  })

})

function reduceAndSnapshot(
  initialState: DataBrowserDataState,
  reduce: Reducer<DataBrowserDataState>,
  actions: ReduxAction[],
  excludeActions: number[] = [],
) {
  let lastState = initialState
  actions.forEach((action, index) => {
    lastState = reduce(lastState, action)
    if (excludeActions.includes(index)) {
      return
    }
    expect(lastState).toMatchSnapshot()
  })
}
