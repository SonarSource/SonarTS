import {ReduxAction} from '../types/reducers'
import Constants from '../constants/popupSources'
import {FieldPopupSource} from 'graphcool-metrics/dist'
import {RelationsPopupSource} from 'graphcool-metrics/dist/events/Console'

export const setFieldPopupSource = (source: FieldPopupSource) => ({
  type: Constants.SET_FIELD_POPUP_SOURCE,
  payload: source,
})

export const setRelationsPopupSource = (source: RelationsPopupSource) => ({
  type: Constants.SET_RELATIONS_POPUP_SOURCE,
  payload: source,
})
