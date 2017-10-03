import * as React from 'react'
import * as cn from 'classnames'

interface Props {
  children?: any
  value: string
  onChange: (e: any) => void
  className?: string
}

export default function Select({children, value, onChange, className}: Props) {
  return (
    <div className={cn('select', className)}>
      <style jsx={true}>{`
        .select {
          @p: .relative;
        }
        select {
          @p: .f20, .blue, .fw6, .tl, .relative;
          border: 2px solid $blue50;
          border-radius: 3px;
          padding: 12px 16px;
          padding-right: 44px;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: none;
        }
        .triangle {
          @p: .absolute, .f12, .blue;
          pointer-events: none;
          top: 18px;
          right: 15px;
        }
        select, .select  :global(option) {
          font-family: 'Open Sans', sans-serif;
        }
      `}</style>
      <select value={value} onChange={onChange}>
        {children}
      </select>
      <div className='triangle'>▼</div>
    </div>
  )
}
