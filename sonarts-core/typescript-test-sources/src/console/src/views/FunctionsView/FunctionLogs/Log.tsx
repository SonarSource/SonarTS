import * as React from 'react'
import {Log} from '../../../types/types'
import * as cn from 'classnames'
import {Icon, $v} from 'graphcool-styles'
import * as moment from 'moment'
// import * as Codemirror from 'react-codemirror'
// import {ResultViewer} from 'graphiql/dist/components/ResultViewer'
// const Codemirror: any = require('./CodeMirror').default
const ResultViewer: any = require('./ResultViewer').ResultViewer

interface Props {
  log: Log
}

interface State {
  expanded: boolean
}

export default class LogComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      expanded: false,
    }
  }
  renderMessage(message) {
    return (
      <div className='graphiql-container' onClick={this.ignoreClick}>
        <style jsx>{`
          .graphiql-container :global(div.CodeMirror) {
            background: transparent;
          }
          .graphiql-container :global(div.CodeMirror-lines) {
            @p: .pa0;
          }
        `}</style>
        <ResultViewer
          value={message}
        />
      </div>
    )
  }
  render() {
    const {log} = this.props
    const {expanded} = this.state
    const error = log.status === 'FAILURE'

    return (
      <tr className={cn({error, expanded})} onClick={this.toggle}>
        <style jsx>{`
          span, .message {
            @p: .f14, .white80;
            line-height: 1.5;
            font-family: 'Source Code Pro', monospace;
            transition: $duration opacity;
            letter-spacing: 0.3px;
          }
          tr {
            @p: .o70, .pointer;
          }
          tr:hover, tr.expanded {
            @p: .o100;
          }
          .error span, .error .message, .error .ago {
            @p: .red;
          }
          td {
            vertical-align: top;
            padding: 2px 10px;
          }
          td:first-child {
            @p: .pl25;
            width: 250px;
          }
          th:nth-child(2) {
            width: 120px;
          }
          td:last-child {
            @p: .pr25;
            width: 120px;
          }
          .ago {
            @p: .green, .fw6, .f14, .tr;
          }
          .message {
            @p: .overflowHidden, .nowrap, .ml6;
            text-overflow: ellipsis;
          }
        `}</style>
        <td><span>{log.timestamp.toString()}</span></td>
        <td><span>{log.duration}ms</span></td>
        <td>
          {expanded ? (
            this.renderMessage(log.message)
          ) : (
            <div className='flex itemsCenter'>
              <Icon
                src={require('graphcool-styles/icons/fill/triangle.svg')}
                color={$v.white80}
                width={6}
                height={6}
              />
              <div className='message'>
                {log.message}
              </div>
            </div>
          )}
        </td>
        <td><div className='ago'>{moment(log.timestamp).fromNow(true)}</div></td>
      </tr>
    )
  }

  private ignoreClick = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  private toggle = () => {
    this.setState(state => {
      return {
        expanded: !state.expanded,
      }
    })
  }
}

// tslint:disable-line
const msg = '{"data":{"allTarget2s":[{"id":"cirs28jtt16m10114amn0mim5","payload":"#prisma","active":false,"target":null},{"id":"cirs28qzh16md0114pw7pkcgk","payload":"art","active":false,"target":null},{"id":"cirs2dpot16w60114ye8srpfz","payload":"#art","active":true,"target":{"completedAt":"2016-08-31T09:51:10.271Z","result":"Successfully followed user https://twitter.com/VigilanteArtist","id":"cisiq2p5a4rrr0126ixlbyuzp","complete":true,"payloadUrl":"https://twitter.com/VigilanteArtist"}},{"id":"cirs2dvvk16wi0114dwtmzs93","payload":"deepstyle","active":false,"target":null},{"id":"ciucj6xw0bamt01915wqt7qlp","payload":"some playload","active":true,"target":{"completedAt":null,"result":"","id":"ciucj6xw0bamq0191xdgptmnc","complete":false,"payloadUrl":"http://twitter.com/user/name"}}]}}'
const message = JSON.stringify(JSON.parse(msg), null, 2)
