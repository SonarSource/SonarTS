import * as React from 'react'

interface Props {

}

export default function WaitingIndicator({}: Props) {
  return (
    <div className='waiting-indicator'>
      <style jsx>{`
        .waiting-indicator {
          @p: .br100, .flex, .itemsCenter, .justifyCenter;
          width: 36px;
          height: 36px;
        }
         @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(0.1);
          }
          50% {
            opacity: 0.1;
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(0.1);
          }
        }
        .inner {
          @p: .bgBlue, .br100, .absolute;
          width: 36px;
          height: 36px;
          animation: pulse 2s ease-out infinite;
        }
        .static {
          @p: .bgBlue, .absolute, .br100;
          width: 18px;
          height: 18px;
        }
      `}</style>
      <div className='inner' />
      <div className='static' />
    </div>
  )
}
