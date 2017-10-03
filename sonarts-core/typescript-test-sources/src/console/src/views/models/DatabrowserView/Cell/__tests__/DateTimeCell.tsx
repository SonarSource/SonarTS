import * as React from 'react' // tslint:disable-line
import DateTimeCell from '../DateTimeCell'
import { shallow } from 'enzyme'
import { shallowToJson } from 'enzyme-to-json'
import {FieldType} from '../../../../../types/types'
import {TypedValue} from '../../../../../types/utils'

test('DateTimeCell renders', () => {

  const save = jest.fn((value: TypedValue) => { /* */ })
  const cancel = jest.fn()
  const onKeyDown = jest.fn()
  const field = {
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
  }

  const component = shallow(
    <DateTimeCell
      value={new Date('Sat Oct 15 2016 20:09:46 GMT+0200 (CEST)')}
      save={save}
      cancel={cancel}
      onKeyDown={onKeyDown}
      field={field}
    />,
  )

  expect(shallowToJson(component)).toMatchSnapshot()

})
