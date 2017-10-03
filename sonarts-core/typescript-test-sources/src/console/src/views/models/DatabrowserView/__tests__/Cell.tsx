import * as React from 'react' // tslint:disable-line
import {Cell} from '../Cell'
import { shallow } from 'enzyme'
import { shallowToJson } from 'enzyme-to-json'
import {FieldType} from '../../../../types/types'

const fields = [{
  id: 'cip3p48sj001d1jsmzqysd6xd',
  name: 'id',
  description: '',
  isReadonly: true,
  isList: false,
  isSystem: true,
  typeIdentifier: 'GraphQLID' as FieldType,
  relatedModel: null,
  isUnique: true,
  isRequired: false,
  enumValues: [],
  model: null,
},
  {
    id: 'cip3p48sj001e1jsmghwkdt2k',
    name: 'description',
    description: '',
    isReadonly: true,
    isList: false,
    isSystem: true,
    typeIdentifier: 'DateTime' as FieldType,
    relatedModel: null,
    isUnique: true,
    isRequired: false,
    enumValues: [],
    model: null,
  },
  {
    id: 'cip3p48sj001f1jsm5z015zjt',
    name: 'name',
    description: '',
    isReadonly: true,
    isList: false,
    isSystem: true,
    typeIdentifier: 'DateTime' as FieldType,
    relatedModel: null,
    isUnique: true,
    isRequired: false,
    enumValues: [],
    model: null,
  },
  {
    id: 'cip3p48sj001g1jsmj8t36lpg',
    name: 'artwork',
    description: '',
    isReadonly: true,
    isList: false,
    isSystem: true,
    typeIdentifier: 'Relation' as FieldType,
    relatedModel: {
      id: 'imageModel',
      name: 'Image',
      namePlural: 'Images',
      fields: {
        edges: [],
      },
      unconnectedReverseRelationFieldsFrom: [],
      itemCount: 5,
      description: '',
      isSystem: false,
      permissions: {edges: []},
      permissionSchema: '',
      permissionQueryArguments: [],
    },
    isUnique: true,
    isRequired: false,
    enumValues: [],
    model: null,
  },
]

test('Cell renders and runs selectCell', () => {

  const reload = jest.fn()
  const update = jest.fn()
  const selectCell = jest.fn()
  const unselectCell = jest.fn()
  const editCell = jest.fn()
  const stopEditCell = jest.fn()
  const nextCell = jest.fn()
  const previousCell = jest.fn()
  const nextRow = jest.fn()
  const previousRow = jest.fn()

  const component = shallow(
    <Cell
      projectId='asd'
      nodeId='asd'
      value='some string'
      field={{
        id: 'cip3p48sj001e1jsmghwkdt2k',
        name: 'description',
        description: '',
        isReadonly: true,
        isList: false,
        isSystem: true,
        typeIdentifier: 'String' as FieldType,
        relatedModel: null,
        isUnique: true,
        isRequired: false,
        enumValues: [],
        model: null,
      }}
      addnew={false}
      backgroundColor='#fff'
      rowSelected={false}
      rowHasCursor={false}
      isReadonly={false}
      needsFocus={false}
      editing={false}
      newRowActive={false}
      rowIndex={3}
      selected={false}
      showNotification={
        () => {
          //
        }
      }
      update={update}
      reload={reload}
      selectCell={selectCell}
      unselectCell={unselectCell}
      editCell={editCell}
      stopEditCell={stopEditCell}
      nextCell={nextCell}
      previousCell={previousCell}
      nextRow={nextRow}
      previousRow={previousRow}
      position={{row: 1, field: 'id'}}
      fields={fields}
      modelNamePlural='Images'
      projectName='Project'
      loaded={[true,true,true,true]}
    />,
  )

  component.find('.root').simulate('click')

  expect(selectCell).toBeCalled()
  expect(editCell).not.toBeCalled()

  expect(shallowToJson(component)).toMatchSnapshot()

})

test('Cell renders in edit mode', () => {

  const reload = jest.fn()
  const update = jest.fn()
  const selectCell = jest.fn()
  const unselectCell = jest.fn()
  const editCell = jest.fn()
  const stopEditCell = jest.fn()
  const nextCell = jest.fn()
  const previousCell = jest.fn()
  const nextRow = jest.fn()
  const previousRow = jest.fn()

  const component = shallow(
    <Cell
      projectId='asd'
      nodeId='asd'
      value='some string'
      field={{
        id: 'cip3p48sj001e1jsmghwkdt2k',
        name: 'description',
        description: '',
        isReadonly: true,
        isList: false,
        isSystem: true,
        typeIdentifier: 'String' as FieldType,
        relatedModel: null,
        isUnique: true,
        isRequired: false,
        enumValues: [],
        model: null,
      }}
      addnew={false}
      backgroundColor='#fff'
      rowSelected={false}
      rowHasCursor={false}
      isReadonly={false}
      needsFocus={false}
      editing={false}
      newRowActive={false}
      rowIndex={3}
      selected={false}
      showNotification={() => {
        //
      }}
      update={update}
      reload={reload}
      selectCell={selectCell}
      unselectCell={unselectCell}
      editCell={editCell}
      stopEditCell={stopEditCell}
      nextCell={nextCell}
      previousCell={previousCell}
      nextRow={nextRow}
      previousRow={previousRow}
      position={{row: 1, field: 'id'}}
      fields={fields}
      modelNamePlural='Images'
      projectName='Project'
      loaded={[true,true,true,true]}
    />,
  )

  expect(shallowToJson(component)).toMatchSnapshot()

})
