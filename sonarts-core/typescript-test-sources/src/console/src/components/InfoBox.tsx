import * as React from 'react'
const InfoBox = (props) => (
  <div className='info-box'>
    <style jsx>{`
      .info-box {
        @p: .bgBlue20, .br2, .pv10, .ph38, .blue;
      }
    `}</style>
    {props.children}
  </div>
)

export default InfoBox
