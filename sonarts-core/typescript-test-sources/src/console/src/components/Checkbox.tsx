import * as React from 'react'
import {Icon, $v} from 'graphcool-styles'
import * as cn from 'classnames'

interface Props {
  checked: boolean
  onToggle: () => void
  children?: any
}

export default function Checkbox({checked, onToggle, children}: Props) {
  return (
    <div className='option-cell' onClick={onToggle}>
      <style jsx>{`
        .option-cell {
          @p: .inlineFlex, .itemsCenter, .pointer;
        }
        .option {
          @p: .flex, .itemsCenter, .justifyCenter, .br100, .ba, .bBlack20;
          width: 25px;
          height: 25px;
        }
        .option-cell:hover .option:not(.checked) {
          @p: .bgGreen10;
        }
        .option.checked {
          @p: .bn, .bgGreen20;
        }
      `}</style>
      <div className={cn('option', {checked})}>
        {checked && (
          <Icon
            src={require('graphcool-styles/icons/fill/check.svg')}
            color={checked ? $v.green : 'white'}
            width={17}
            height={17}
          />
        )}
      </div>
      {children || null}
    </div>
  )
}
