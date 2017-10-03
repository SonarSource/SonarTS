import {Field} from '../../../../types/types'
import * as React from 'react'
import IntCell from './IntCell'
import FloatCell from './FloatCell'
import BooleanCell from './BooleanCell'
import EnumCell from './EnumCell'
import StringCell from './StringCell'
import JsonCell from './JsonCell'
import DateTimeCell from './DateTimeCell'
import DefaultCell from './DefaultCell'
import NodeSelector from '../../../../components/NodeSelector/NodeSelector'
import RelationsPopup from '../RelationsPopup'
import {isScalar, isNonScalarList} from '../../../../utils/graphql'
import ScalarListCell from './ScalarListCell'
import NullableCell from './NullableCell'
import SelectNodesCell from './SelectNodesCell/SelectNodesCell'

export interface CellRequirements {
  value: any
  field: Field
  projectId: string
  nodeId?: string
  inList?: boolean
  methods: {
    save: (val: any, keepEditing?: any) => void
    cancel: (reload?: boolean) => void
    onKeyDown: (e: React.KeyboardEvent<HTMLSelectElement | HTMLInputElement>, what?: boolean) => void,
  }
}

export function getEditCell(reqs: CellRequirements): JSX.Element {
  if (reqs.field.isRequired || isNonScalarList(reqs.field) || reqs.field.isList) {
    return getSpecificEditCell(reqs)
  } else {
    return (
      <NullableCell
        save={reqs.methods.save}
        cell={getSpecificEditCell(reqs)}
      />
    )
  }
}

function getSpecificEditCell(reqs: CellRequirements): JSX.Element {
  if (!isScalar(reqs.field.typeIdentifier)) {
    return getNonScalarEditCell(reqs)
  }

  if (reqs.field.isList) {
    return getScalarListEditCell(reqs)
  }

  return getScalarEditCell(reqs)
}

function getNonScalarListEditCell(reqs: CellRequirements): JSX.Element {
  return (
    <RelationsPopup
      originField={reqs.field}
      originNodeId={reqs.nodeId}
      onCancel={() => reqs.methods.cancel(true)}
      projectId={reqs.projectId}
    />
  )
}

function getNonScalarEditCell(reqs: CellRequirements): JSX.Element {
  const isList = reqs.field.isList
  let values

  if (isList) {
    values = reqs.value
  } else {
    // if it is null, don't add []
    values = reqs.value ? [reqs.value] : reqs.value
  }

  return (
    <SelectNodesCell
      endpointUrl={`${__BACKEND_ADDR__}/simple/v1/${reqs.projectId}`}
      projectId={reqs.projectId}
      model={reqs.field.relatedModel}
      multiSelect={reqs.field.isList}
      save={reqs.methods.save}
      cancel={reqs.methods.cancel}
      field={reqs.field}
      nodeId={reqs.nodeId}
    />
  )
}

function getScalarListEditCell(reqs: CellRequirements): JSX.Element {
  return (
    <ScalarListCell
      {...reqs}
    />
  )
}

export function getScalarEditCell(reqs: CellRequirements): JSX.Element {
  switch (reqs.field.typeIdentifier) {
    case 'Int':
      return (
        <IntCell
          value={reqs.value}
          save={reqs.methods.save}
          onKeyDown={reqs.methods.onKeyDown}
          field={reqs.field}
          cancel={reqs.methods.cancel}
        />
      )
    case 'Float':
      return (
        <FloatCell
          value={reqs.value}
          save={reqs.methods.save}
          onKeyDown={reqs.methods.onKeyDown}
          field={reqs.field}
          cancel={reqs.methods.cancel}
        />
      )
    case 'Boolean':
      return (
        <BooleanCell
          value={reqs.value}
          save={reqs.methods.save}
          onKeyDown={reqs.methods.onKeyDown}
          field={reqs.field}
          cancel={reqs.methods.cancel}
        />
      )
    case 'Enum':
      return (
        <EnumCell
          value={reqs.value}
          save={reqs.methods.save}
          onKeyDown={reqs.methods.onKeyDown}
          field={reqs.field}
          cancel={reqs.methods.cancel}
        />
      )
    case 'String':
      return (
        <StringCell
          value={reqs.value}
          onKeyDown={reqs.methods.onKeyDown}
          save={reqs.methods.save}
          field={reqs.field}
          cancel={reqs.methods.cancel}
        />
      )
    case 'Json':
      return (
        <JsonCell
          value={reqs.value}
          onKeyDown={reqs.methods.onKeyDown}
          save={reqs.methods.save}
          field={reqs.field}
          cancel={reqs.methods.cancel}
        />
      )
    case 'DateTime':
      // we don't need inList for the other components yet
      return (
        <DateTimeCell
          cancel={reqs.methods.cancel}
          onKeyDown={reqs.methods.onKeyDown}
          save={reqs.methods.save}
          value={reqs.value}
          field={reqs.field}
          inList={reqs.inList}
        />
      )
    default:
      return (
        <DefaultCell
          value={reqs.value}
          onKeyDown={reqs.methods.onKeyDown}
          save={reqs.methods.save}
          field={reqs.field}
          cancel={reqs.methods.cancel}
        />
      )
  }
}
