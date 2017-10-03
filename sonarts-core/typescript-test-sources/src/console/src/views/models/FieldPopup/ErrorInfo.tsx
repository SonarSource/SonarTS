import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'

const ErrorInfo = (props) => (
  <div className='info'>
    <style jsx>{`
      .tooltip {
        @inherit: .dn, .absolute;
        z-index: 20;
        width: 200px;
        padding-top: 10px;
        left: -150px;
      }
      .tooltip-content {
        @inherit: .br2, .bgWhite, .pa16, .black50, .f14, .fw4, .relative, .buttonShadow;
        &:before {
          @inherit: .absolute, .bgWhite;
          content: "";
          top: -4px;
          left: 158px;
          transform: rotate(45deg);
          width: 8px;
          height: 8px;
        }
      }
      .info {
        @inherit: .ml10, .relative;
        &:hover .tooltip {
          @inherit: .db;
        }
      }

    `}</style>
    <Icon
      src={require('../../../assets/icons/warning_red.svg')}
      width={22}
      height={22}
    />
    <div className='tooltip'>
      <div className='tooltip-content'>
        {props.children}
      </div>
    </div>
  </div>
)

export default ErrorInfo
