import * as React from 'react'
import {TestResponse} from './TestPopup'
const ResultViewer: any = require('../FunctionLogs/ResultViewer').ResultViewer
import {Icon, $v} from 'graphcool-styles'
import * as moment from 'moment'
import * as cn from 'classnames'

interface Props {
  response: TestResponse
}

export default function TestLog({response}: Props) {
  const date = new Date(response.timestamp)
  const ago = moment(date).fromNow()
  const error = response.isError

  return (
    <div className={cn('test-log', {error})}>
      <style jsx={true}>{`
        .test-log {
          @p: .w100, .overflowAuto, .mb25;
          min-width: 200px;
          max-width: calc(100vw - 700px);
        }
        .test-log.error .line {
          @p: .bgRed, .o30;
        }
        .header {
          @p: .flex, .itemsCenter;
        }
        .line {
          @p: .flexAuto, .bgGreen30, .mh10;
          height: 2px;
        }
        .header-sides {
          @p: .flexFixed, .green, .f12;
        }
        .test-log.error .header-sides {
          @p: .red;
        }
        .graphiql-container :global(div.CodeMirror) {
          background: transparent;
        }
        .graphiql-container :global(div.CodeMirror-lines) {
          @p: .pa0;
        }
        .meta {
          @p: .mv10;
        }
        .meta-entry {
          @p: .flex, .itemsCenter, .mb6;
        }
        .label {
          @p: .ttu, .white40, .f12, .fw6;
          letter-spacing: 0.6px;
          min-width: 72px;
        }
        .value {
          @p: .mono, .ml10, .f14, .white80;
          letter-spacing: 0.6px;
        }
      `}</style>
      <div className='header'>
        <div className='header-sides'>
          {error ? (
            <Icon src={require('graphcool-styles/icons/stroke/cross.svg')} color={$v.red} stroke strokeWidth={4} />
          ) : (
            <Icon src={require('graphcool-styles/icons/fill/check.svg')} color={$v.green} />
          )}
        </div>
        <div className='line' />
        <div className='header-sides'>{ago}</div>
      </div>
      <div className='meta'>
        {['timestamp', 'duration'].map(key => (
          <div className='meta-entry'>
            <div className='label'>{key}</div>
            <div className='value'>{response[key]}</div>
          </div>
        ))}
      </div>
      <div className='graphiql-container'>
        <ResultViewer
          value={JSON.stringify(response, null, 2)}
        />
      </div>
    </div>
  )
}
// value={response.webhook ? response.webhook.response.body : response.inline.logs}
