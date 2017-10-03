import * as React from 'react'
import * as cn from 'classnames'

interface Props {
  active?: boolean
  children?: any
  style?: any
}

export default function StepMarker({active, children, style}: Props) {
  return (
    <div style={style} className='step-marker-wrapper'>
      <div className={cn('step-marker', {active})}>
        <style jsx={true}>{`
          .step-marker-wrapper {
            @p: .absolute;
          }
          .step-marker {
            @p: .br2, .brLeft, .inlineFlex, .itemsCenter, .justifyCenter, .relative, .fw6, .darkBlue, .f14;
            letter-spacing: 0.6px;
            background-color: #cdd0d4;
            height: 20px;
            width: 20px;
            padding-left: 2px;
            line-height: 20px;
          }
          .step-marker.active {
            @p: .white, .bgBlue;
          }
          .step-marker:after {
            @p: .absolute;
            right: -9px;
            content: "";
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 10px 0 10px 9px;
            border-color: transparent transparent transparent #cdd0d4;
          }
          .step-marker.active:after {
            border-color: transparent transparent transparent $blue;
          }
        `}</style>
        {children}
      </div>
    </div>
  )
}
