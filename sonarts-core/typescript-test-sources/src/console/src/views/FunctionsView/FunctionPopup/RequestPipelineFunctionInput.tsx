import * as React from 'react'
const QueryEditor: any = require('../../SchemaView/Editor/QueryEditor').QueryEditor
const ResultViewer: any = require('../FunctionLogs/ResultViewer').ResultViewer
import {Icon, $v} from 'graphcool-styles'
import * as cn from 'classnames'
import JsEditor from './JsEditor'
import Toggle from './Toggle'
import WebhookEditor from './WebhookEditor'
import * as Modal from 'react-modal'
import {fieldModalStyle} from '../../../utils/modalStyle'
import StepMarker from './StepMarker'
import {EventType} from './FunctionPopup'
import { buildClientSchema, introspectionQuery } from 'graphql'
import {CustomGraphiQL} from 'graphcool-graphiql'
import {getEventInput} from './TestPopup'

interface Props {
  schema: string
  onChange: (value: string) => void
  value: string
  isInline: boolean
  onIsInlineChange: (value: boolean) => void
  webhookUrl: string
  onChangeUrl: (url: string) => void
  headers: {[key: string]: string}
  onChangeHeaders: (headers: {[key: string]: string}) => void
  editing: boolean
  eventType: EventType
  onChangeQuery: (query: string) => void
  query: string
  projectId: string
  sssModelName: string
}

interface State {
  inputWidth: number
  fullscreen: boolean
  ssschema: any
  showExample: boolean
}

const modalStyling = {
  ...fieldModalStyle,
  content: {
    ...fieldModalStyle.content,
    width: window.innerWidth,
  },
  overlay: {
    ...fieldModalStyle.overlay,
    backgroundColor: 'rgba(15,32,46,.9)',
  },
}

export default class RequestPipelineFunctionInput extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      inputWidth: 200,
      fullscreen: false,
      ssschema: null,
      showExample: false,
    }
  }
  render() {
    const {fullscreen} = this.state

    if (fullscreen) {
      return (
        <Modal
          isOpen
          style={modalStyling}
          contentLabel='Function Editor'
          onRequestClose={this.toggleFullscreen}
        >
          {this.renderComponent()}
        </Modal>
      )
    }

    return this.renderComponent()
  }
  componentDidMount() {
    if (this.props.eventType === 'SSS') {
      this.fetchSSSchema()
    }
  }
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.eventType === 'SSS') {
      this.fetchSSSchema()
    }
  }
  fetchSSSchema() {
    const {projectId} = this.props
    const endpointUrl = `${__BACKEND_ADDR__}/simple/v1/${projectId}`

    return fetch(endpointUrl, { // tslint:disable-line
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-graphcool-source': 'console:playground',
      },
      body: JSON.stringify({query: introspectionQuery}),
    })
      .then((response) => {
        return response.json()
      })
      .then((res: any) => {
        const ssschema = buildClientSchema(res.data)
        // trim out mutationType and queryType
        ssschema['_mutationType']['_fields'] = {}
        ssschema['_queryType']['_fields'] = {}
        this.setState({ssschema} as State)
      })
  }
  renderComponent() {
    const {inputWidth, fullscreen, showExample} = this.state
    const {
      schema, value, onChange, onIsInlineChange, isInline, onChangeUrl, webhookUrl, eventType, sssModelName,
    } = this.props
    const {onChangeQuery} = this.props

    const inputTitle = eventType === 'RP' ? 'Event Type' : 'Subscription Query'
    const input = getEventInput(eventType, schema, sssModelName)

    return (
      <div className={cn('request-pipeline-function-input', {
        fullscreen,
        rp: eventType === 'RP',
        sss: eventType === 'SSS',
      })}>
        <style jsx>{`
          .request-pipeline-function-input {
            @p: .br2, .buttonShadow, .flex;
            height: 320px;
            margin-left: -4px;
            margin-right: -4px;
          }
          .request-pipeline-function-input.fullscreen {
            @p: .pa60, .center;
            height: 100vh;
          }
          .input {
            @p: .pa20, .relative, .br2, .brLeft, .bgDarkBlue;
          }
          .input.rp :global(.CodeMirror-cursor) {
            @p: .dn;
          }
          .input.rp :global(.CodeMirror-selected) {
            background: rgba(255,255,255,.1);
          }
          .input :global(.CodeMirror), .input :global(.CodeMirror-gutters) {
            background: transparent;
          }
          .input.sss :global(.CodeMirror-gutters) {
            @p: .bgDarkBlue;
          }
          .input.sss :global(.variable-editor) {
            @p: .dn;
          }
          .input.sss {
            @p: .w50, .pl0, .pr0, .pb0, .flex, .flexColumn;
          }
          .input.sss :global(.graphiql-container) {
            @p: .flexAuto, .overflowAuto, .h100;
          }
          .input.sss :global(.CodeMirror-lines) {
            @p: .pt0;
          }
          .input.sss :global(.CodeMirror) {
            padding-left: 3px;
            font-size: 13px;
          }
          .input.sss :global(.docExplorerWrap) {
            height: auto;
          }
          .input.sss :global(.docs-button) {
            top: 120px;
          }
          .event-input {
            @p: .darkBlue30, .ttu, .f14, .fw6, .flex, .itemsCenter, .mb10;
            letter-spacing: 0.3px;
          }
          .event-input span {
            @p: .mr10;
          }
          .sss-input {
            @p: .f12, .ttu, .fw6, .white40, .mb10, .flexFixed, .flex, .pl16;
            letter-spacing: 0.4px;
          }
          .sss-editor {
            @p: .overflowAuto, .flexAuto, .flex, .flexColumn;
          }
          .function {
            @p: .br2, .brRight, .bgDarkerBlue, .flexAuto, .flex, .flexColumn;
          }
          .head {
            @p: .flex, .justifyBetween, .flexFixed, .pa16;
          }
          .head :global(i) {
            @p: .pointer;
          }
          .body {
            @p: .pt6, .flex, .flexColumn, .flexAuto, .br2, .brRight;
          }
        `}</style>
        <style jsx global>{`
          .CodeMirror-hints {
            @p: .z999;
          }
        `}</style>
        <div className={cn('input', {sss: eventType === 'SSS', rp: eventType === 'RP'})}>
          <div className='sss-input'>
            {eventType === 'SSS' && !this.props.editing && (
              <StepMarker style={{left: -29, top: -1, position: 'relative'}}>2</StepMarker>
            )}
            <Toggle
              choices={[inputTitle, 'Example Event']}
              activeChoice={this.state.showExample ? 'Example Event' : inputTitle}
              onChange={this.handleInputChange}
            />
          </div>
          {showExample && (
            <div className='sss-editor pl16'>
              <ResultViewer
                value={input}
              />
            </div>
          )}
          {!showExample && eventType === 'RP' && (
            <QueryEditor
              value={schema}
              readOnly
              hideLineNumbers
              hideFold
            />
          )}
          {!showExample && eventType === 'SSS' && (
            <div className='sss-editor'>
              <CustomGraphiQL
                rerenderQuery={true}
                schema={this.state.ssschema}
                variables={''}
                query={this.props.query}
                fetcher={() => { return null }}
                disableQueryHeader
                queryOnly
                showDocs
                onEditQuery={onChangeQuery}
              />
            </div>
          )}
        </div>
        <div className='function'>
          <div className='head'>
            <div className='flex'>
              {!this.props.editing && (
                <StepMarker style={{left: -20, top: -1, position: 'relative'}}>
                  {eventType === 'RP' && '2'}
                  {eventType === 'SSS' && '3'}
                </StepMarker>
              )}
              <Toggle
                choices={['Inline Code', 'Webhook']}
                activeChoice={isInline ? 'Inline Code' : 'Webhook'}
                onChange={choice => choice === 'Inline Code' ? onIsInlineChange(true) : onIsInlineChange(false)}
              />
            </div>
            <Icon
              src={
                fullscreen ? require('assets/icons/compress.svg') : require('assets/icons/extend.svg')
              }
              stroke
              strokeWidth={1.5}
              color={$v.white50}
              onClick={this.toggleFullscreen}
            />
          </div>
          <div className='body'>
            {isInline ? (
              <JsEditor onChange={onChange} value={value} />
            ) : (
              <WebhookEditor
                onChangeUrl={this.props.onChangeUrl}
                url={webhookUrl}
                headers={this.props.headers}
                onChangeHeaders={this.props.onChangeHeaders}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  private handleInputChange = (_, i: number) => {
    const showExample = i === 1
    this.setState({showExample} as State)
  }

  private handleResize = (inputWidth: number) => {
    this.setState({inputWidth} as State)
  }

  private toggleFullscreen = () => {
    this.setState(state => {
      return {
        ...state,
        fullscreen: !state.fullscreen,
      }
    })
  }
}
