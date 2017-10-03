import * as React from 'react'
import {Icon, $v} from 'graphcool-styles'

interface Props {
  label: string
  checked: boolean
  onToggle: () => void
  scale?: number
}

const OptionInput = ({label, checked, onToggle, scale = 1}: Props) => (
  <div
    className={'option-input' + (checked ? ' checked' : '')}
    onClick={onToggle}
  >
    <style jsx>{`
      .option-input {
        @p: .flex, .itemsCenter, .pointer;
      }
      .option {
        @p: .br100, .flex, .itemsCenter, .justifyCenter, .pointer, .bbox;
        border: 1px solid rgba(0,0,0,.25);
        width: 20px;
        height: 20px;
      }
      .checked .option {
        @p: .bgGreen20;
        border: none;
      }
      .checked .label {
        color: rgba(0,0,0,.5);
      }
      .label {
        @p: .ml10, .f16;
        color: rgba(0,0,0,.35);
      }
    `}</style>
    <div
      className='option'
      style={{
        transform: `scale(${scale}`,
      }}
    >
      {checked && (
        <Icon
          src={require('graphcool-styles/icons/fill/check.svg')}
          color={$v.green}
          width={12}
          height={12}
        />
      )}
    </div>
    <div className='label'>{label}</div>
  </div>
)

export default OptionInput
