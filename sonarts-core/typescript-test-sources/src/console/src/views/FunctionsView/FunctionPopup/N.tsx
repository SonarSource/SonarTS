import * as React from 'react'
import * as cn from 'classnames'

interface Props {
  active?: boolean
  children?: any
  className?: string
}

export default function N({active, children, className}: Props) {
  return (
    <span className={cn('n', {active}, className)}>
      <style jsx>{`
        .n {
          @p: .br2, .tc, .white, .f14, .fw6, .dib, .mh4;
          width: 18px;
          height: 18px;
          line-height: 18px;
          background-color: #a2aab0;
        }
        .n.active {
          @p: .bgBlue, .white;
        }
      `}</style>
      {children}
    </span>
  )
}
