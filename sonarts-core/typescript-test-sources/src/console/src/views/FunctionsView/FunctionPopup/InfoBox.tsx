import * as React from 'react'
import {Icon, $v} from 'graphcool-styles'

export default function InfoBox(props) {
  return (
    <div className='info-box'>
      <style jsx>{`
        .info-box {
          @p: .pa10, .bgBlue20, .br2, .blue, .f16, .inlineFlex, .pr25;
        }
        .info {
          @p: .bgBlue20, .br100, .flex, .itemsCenter, .justifyCenter, .i, .fw7, .tc, .f12, .flexFixed;
          font-family: Georgia;
          line-height: 1;
          width: 18px;
          height: 18px;
          margin-top: 3px;
        }
      `}</style>
      <div className='info'><span>i</span></div>
      <div className='ml10'>
        {props.children}
      </div>
    </div>
  )
}
