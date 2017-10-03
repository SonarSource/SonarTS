import * as React from 'react' // tslint:disable-line
import ScalarListCell from '../ScalarListCell'
import { shallow } from 'enzyme'
import { shallowToJson } from 'enzyme-to-json'
import {TypedValue} from '../../../../../types/utils'
import {FieldType} from '../../../../../types/types'

test('ScalarListCell renders', () => {

  const save = jest.fn((value: TypedValue) => {  /* */ })
  const cancel = jest.fn()
  const onKeyDown = jest.fn()
  const field = {
    id: 'cip3p48sj001e1jsmghwkdt2k',
    name: 'description',
    description: '',
    isReadonly: true,
    isList: true,
    isSystem: true,
    typeIdentifier: 'Int' as FieldType,
    relatedModel: null,
    isUnique: true,
    isRequired: false,
    enumValues: [],
    model: null,
  }

  const component = shallow(
    <ScalarListCell
      value={[1,2,3]}
      nodeId={null}
      projectId={null}
      methods={{
        save, cancel, onKeyDown,
      }}
      field={field}
    />,
  )

  expect(shallowToJson(component)).toMatchSnapshot()

})
