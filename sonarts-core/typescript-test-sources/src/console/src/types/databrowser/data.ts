import * as Immutable from 'immutable'
import {OrderBy} from '../../types/types'

export interface DataBrowserDataState {
  nodes: Immutable.List<Immutable.Map<string, any>>
  backup: {
    nodes: Immutable.List<Immutable.Map<string, any>>
    itemCount: number
    loaded: Immutable.List<boolean>,
  }
  orderBy: OrderBy
  filter: Immutable.Map<string, any>
  itemCount: number
  loaded: Immutable.List<boolean>
  mutationActive: boolean
  countChanges: Immutable.Map<string, number>
  newRowShown: boolean
}
