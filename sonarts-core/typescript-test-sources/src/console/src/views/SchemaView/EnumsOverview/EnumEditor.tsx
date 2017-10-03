import * as React from 'react'
import {$v, Icon} from 'graphcool-styles'
import * as cn from 'classnames'

interface Props {
  enums: string[]
  onChange: (enums: string[]) => void
  readOnly?: boolean
}

interface State {
  addingEnum: boolean
  enumValue: string
}

export default class EnumEditor extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      addingEnum: props.values ? props.values.length === 0 : true,
      enumValue: '',
    }
  }

  render() {
    const {enums, onChange, readOnly} = this.props
    const {addingEnum, enumValue} = this.state

    return (
      <div className='enum-editor'>
        <style jsx={true}>{`
        .enum-editor {
          @p: .flex, .itemsCenter, .flexWrap;
        }
        .value {
          @p: .br2, .pv6, .ph10, .mr6, .black60, .fw6, .f14, .bgBlack10, .pointer, .flex, .itemsCenter, .mb6;
        }
        .value:hover {
          @p: .bgBlack20, .black70;
        }
        .value:not(.readOnly):hover:after {
          @p: .pl4, .f16, .fw7;
          line-height: 1;
          content: "×";
        }
        .plus {
          @p: .bgBlue20, .flex, .itemsCenter, .justifyCenter, .br100, .ml10, .pointer;
          height: 26px;
          width: 26px;
        }
        input {
          @p: .f14, .blue;
        }
      `}</style>
        {enums.map(enumValue => (
          <div key={enumValue} className={cn('value', {readOnly})} onClick={() => this.rmValue(enumValue)}>
            <span>{enumValue}</span>
          </div>
        ))}
        {addingEnum && !readOnly && (
          <input
            type='text'
            value={enumValue}
            onChange={this.handleChangeEnumValue}
            placeholder='Add an enum value'
            onKeyDown={this.keyDown}
          />
        )}
        {!readOnly && (
          <div className='plus' onClick={this.addEnum}>
            <Icon
              src={require('graphcool-styles/icons/stroke/add.svg')}
              width={20}
              height={20}
              color={$v.blue}
              stroke
              strokeWidth={3}
            />
          </div>
        )}
      </div>
    )
  }

  private rmValue = (value) => {
    if (this.props.readOnly) {
      return
    }
    const index = this.props.enums.indexOf(value)
    const newEnums = this.props.enums.slice(0)
    newEnums.splice(index, 1)
    this.props.onChange(newEnums)
  }

  private handleChangeEnumValue = (e) => {
    this.setState({enumValue: e.target.value.trim()} as State)
  }

  private addEnum = () => {
    if (this.state.addingEnum) {
      this.submitCurrentValue()
    } else {
      this.setState({addingEnum: true} as State)
    }
  }

  private keyDown = e => {
    if (e.keyCode === 13 || e.keyCode === 32) {
      e.preventDefault()
      this.submitCurrentValue()
    }
  }

  private submitCurrentValue() {
    this.props.onChange(this.props.enums.concat(this.state.enumValue))
    this.setState({enumValue: ''} as State)
  }
}
