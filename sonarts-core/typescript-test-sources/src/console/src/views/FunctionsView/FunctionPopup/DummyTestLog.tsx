import * as React from 'react'

interface Props {

}

export default function DummyTestLog({}: Props) {
  return (
    <div className='dummy-test-log'>
      <style jsx>{`
        .dummy-test-log {
          @p: .w100, .overflowAuto, .mb38;
          min-width: 600px;
          max-width: calc(100vw - 700px);
        }
        .dummy-test-log div:not(.head):not(.sides):not(.row):not(.flex) {
          @p: .bgWhite04;
        }
        .circle {
          @p: .br100;
          width: 12px;
          height: 12px;
        }
        .stripe {
          @p: .br2;
          height: 11px;
        }
        .line {
          @p: .flexAuto, .mh10;
          height: 2px;
        }
        .sides {
          @p: .flexFixed;
        }
        .head {
          @p: .flex, .itemsCenter
        }
        .row {
          @p: .flex, .mt10;
        }
        .row div:first-child {
          width: 30%;
        }
      `}</style>
      <div className='head'>
        <div className='sides'><div className='circle'></div></div>
        <div className='line'></div>
        <div className='sides'>
          <div className='stripe' style={{width: 60}}></div>
        </div>
      </div>
      <div className='row'>
        <div className='flex'>
          <div className='stripe' style={{width: '86%'}} />
        </div>
        <div className='stripe' style={{width: '60%'}} />
      </div>
      <div className='row'>
        <div className='flex'>
          <div className='stripe' style={{width: '62%'}} />
        </div>
        <div className='stripe' style={{width: '50%'}} />
      </div>
      <div className='stripe' style={{width: '70%', marginTop: 20}} />
    </div>
  )
}
