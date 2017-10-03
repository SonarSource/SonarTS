import * as React from 'react'
import FieldHorizontalSelect from './FieldHorizontalSelect'
import {$v, Icon} from 'graphcool-styles'
import {fieldTypes} from './constants'
import FieldLabel from './FieldLabel'
import OptionInput from './OptionInput'
import {Enum, FieldType} from '../../../types/types'
import * as TagsInput from 'react-tagsinput'
import {FieldPopupErrors} from './FieldPopupState'
import ErrorInfo from './ErrorInfo'
import Tether from '../../../components/Tether/Tether'
import {ShowNotificationCallback} from '../../../types/utils'
import {Combobox} from 'react-input-enhancements'
import * as cn from 'classnames'

require('./react-tagsinput.css')

interface Props {
  style?: any
  name: string
  description: string
  typeIdentifier: string
  isList: boolean
  onChangeName: Function
  onChangeDescription: Function
  onChangeTypeIdentifier: (type: FieldType) => void
  onToggleIsList: () => void
  onChangeEnumValues: (values: string[]) => void
  onChangeEnumId: (id: string) => void
  enumValues: string[]
  errors: FieldPopupErrors
  showErrors: boolean
  showNotification: ShowNotificationCallback
  enumId: string
  enums: Enum[]
  isGlobalEnumsEnabled: boolean
}

interface State {
  editingEnumValues: boolean
  showTagInput: boolean
}

export default class BaseSettings extends React.Component<Props,State> {
  tagInput: any
  constructor(props) {
    super(props)

    this.state = {
      editingEnumValues: false,
      showTagInput: false,
    }
  }
  render() {
    const {
      name,
      description,
      typeIdentifier,
      isList,
      style,
      onChangeTypeIdentifier,
      onChangeDescription,
      onChangeName,
      onToggleIsList,
      onChangeEnumValues,
      enumValues,
      errors,
      showErrors,
    }  = this.props

    const {editingEnumValues} = this.state

    return (
      <div style={style} className='base-settings'>
        <style jsx={true}>{`
          .base-settings {
            @p: .w100;
          }
          .list-settings {
            @p: .pl38, .pb38;
          }
          .enum-values {
            @p: .ph38, .pb38;
            min-height: 52px;
          }
          .enum-values-placeholder {
            @p: .flex, .relative, .pointer;
            top: 10px;
            left: -2px;
          }
          .enum-values-placeholder-text {
            @p: .blue, .o50;
            margin-left: 14px;
          }
          .type-error {
            @p: .absolute;
            margin-top: -69px;
            right: -38px;
          }
          .enum-error {
            @p: .absolute;
            margin-top: -15px;
            right: 15px;
          }
        `}</style>
        <style jsx global>{`
          .field-popup-plus {
            @p: .flex, .itemsCenter, .justifyCenter, .br100, .bgBlue20, .pointer;
            height: 26px;
            width: 26px;
          }
        `}</style>
        <FieldLabel
          name={name}
          description={description}
          onChangeDescription={onChangeDescription}
          onChangeName={onChangeName}
          errors={errors}
          showErrors={showErrors}
        />
        <Tether
          steps={[
            {
              step: 'STEP2_SELECT_TYPE_IMAGEURL',
              title: 'Select the type "String"',
            },
            {
              step: 'STEP2_SELECT_TYPE_DESCRIPTION',
              title: 'Select the type "String"',
            },
          ]}
          offsetX={5}
          offsetY={5}
          width={240}
          side={'top'}
        >
          <FieldHorizontalSelect
            activeBackgroundColor={$v.blue}
            inactiveBackgroundColor='#F5F5F5'
            choices={this.mapEnumComponent(fieldTypes)}
            selectedIndex={fieldTypes.indexOf(typeIdentifier || '')}
            inactiveTextColor={$v.gray30}
            onChange={(index) => onChangeTypeIdentifier(fieldTypes[index] as FieldType)}
          />
        </Tether>
        {showErrors && errors.typeMissing && (
          <div className='type-error'>
            <ErrorInfo>
              You must specify a Field Type.
            </ErrorInfo>
          </div>
        )}
        {typeIdentifier === 'Enum' && !this.props.isGlobalEnumsEnabled && (
          <div className='enum-values'>
            {editingEnumValues || enumValues.length > 0 ? (
              <TagsInput
                onlyUnique
                addOnBlur
                addKeys={[9, 13, 32]}
                value={enumValues}
                onChange={this.handleChange}
                renderInput={this.renderTagInputElement}
              />
            ) : (
              <div className='enum-values-placeholder' onClick={this.editEnumValues}>
                <div className='field-popup-plus'>
                  <Icon
                    src={require('graphcool-styles/icons/stroke/add.svg')}
                    stroke
                    strokeWidth={4}
                    color={$v.blue}
                    width={26}
                    height={26}
                  />
                </div>
                <div className='enum-values-placeholder-text'>add space-separated enum values</div>
              </div>
            )}
            {showErrors && errors.enumValueMissing && (
              <div className='enum-error'>
                <ErrorInfo>
                  You must specify enum values
                </ErrorInfo>
              </div>
            )}
          </div>
        )}
        <div className='list-settings'>
          <OptionInput
            label='Store multiple values in this field'
            checked={isList}
            onToggle={onToggleIsList}
          />
        </div>
      </div>
    )
  }

  private mapEnumComponent = (types: any[]) => {
    const active = this.props.typeIdentifier === 'Enum'
    return types.map(type => {
      if (type === 'Enum' && this.props.isGlobalEnumsEnabled) {
        const value = this.props.enums.find(e => e.id === this.props.enumId)
        return (
          <div className={cn('enum', {active})}>
            <style jsx>{`
              .enum :global(input) {
                @p: .f14, .fw6, .black30;
                background: transparent;
              }
              .enum.active :global(input) {
                @p: .white;
              }
            `}</style>
            <style jsx global>{`
              .enum .dropdown>div:nth-child(3) {
                width: 100% !important;
                left: 0 !important;
              }
            `}</style>
            <Combobox
              value={value ? value.name : ''}
              dropdownProps={{
                className: `dropdown`,
              }}
              options={this.props.enums.map(value => value.name)}
              onSelect={(name: string) => {
                const enumId = this.props.enums.find(e => e.name === name).id
                this.props.onChangeEnumId(enumId)
              }}
              disabled={!active}
            >
              {({style, ...inputProps}) => {
                const newStyle = {
                  ...style,
                  width: 130,
                }
                return <input
                  {...inputProps}
                  style={newStyle}
                  type='text'
                  placeholder='Choose an enum...'
                />
              }}
            </Combobox>
          </div>
        )
      }
      return type
    })
  }

  private handleChange = (enumValues: string[]) => {
    if (enumValues.length > 0) {
      const newEnum = enumValues[enumValues.length - 1]
      const newFirstChar = newEnum[0]
      const firstCharNumber = parseInt(newFirstChar, 10)
      if (newFirstChar === newFirstChar.toLowerCase() || !isNaN(firstCharNumber)) {
        const proposal1 = newEnum[0].toUpperCase() + newEnum.slice(1, newEnum.length)
        const proposal2 = newEnum.toUpperCase()
        this.props.showNotification({
          message: `${newEnum} is no valid enum value, the first character must be an uppercase letter.`
          + ` Try '${proposal1}' or '${proposal2}'.`,
          level: 'error',
        })
        return
      }
    }
    this.props.onChangeEnumValues(enumValues)
  }

  private renderTagInputElement = (props) => {
    let {onChange, value, addTag, onBlur, placeholder, ...other} = props
    const {showTagInput} = this.state

    return (
      <div className='tag-input'>
        <style jsx>{`
          .tag-input {
            @p: .inlineFlex, .itemsCenter, .relative;
            height: 42px;
            padding-bottom: 4px;
          }
          .input {
            @p: .f16, .blue, .mr10;
          }
        `}</style>
        {showTagInput && (
          <input
            autoFocus
            type='text'
            onChange={onChange}
            value={value}
            onBlur={onBlur}
            placeholder='Add an enum value'
            {...other}
            className='input enum-input'
          />
        )}
        <div className='field-popup-plus' onClick={() => this.handlePlusClick(onBlur, value)}>
          <Icon
            src={require('graphcool-styles/icons/stroke/add.svg')}
            stroke
            strokeWidth={4}
            color={$v.blue}
            width={26}
            height={26}
          />
        </div>
      </div>
    )
  }

  private handlePlusClick = (onBlur, value) => {
    if (this.state.showTagInput) {
      onBlur({
        target: {value},
      })
    } else {
      this.showTagInput()
    }
  }

  private showTagInput = () => {
    this.setState({
      showTagInput: true,
    } as State)
  }

  private editEnumValues = () => {
    this.setState({editingEnumValues: true, showTagInput: true})
  }
}
