import * as React from 'react'
import {Icon, $v} from 'graphcool-styles'
import {smoothScrollTo} from '../../../utils/smooth'

interface Props {
  url: string
  onChangeUrl: (url: string) => void
  headers: {[key: string]: string}
  onChangeHeaders: (headers: {[key: string]: string}) => void
}

interface State {
  addingRow: boolean
  currentName: string
  currentValue: string
}

export default class WebhookEditor extends React.Component<Props, State> {

  private ref: any

  constructor(props) {
    super(props)

    this.state = {
      addingRow: false,
      currentName: '',
      currentValue: '',
    }
  }

  render() {
    const {url, onChangeUrl, headers} = this.props
    const {addingRow} = this.state
    return (
      <div className='webhook-editor' ref={this.setRef}>
        <style jsx={true}>{`
          .webhook-editor {
            @p: .overflowAuto, .flexAuto, .flex, .flexColumn;
          }
          textarea {
            @p: .f14, .white, .mono, .ph25, .w100, .flexFixed;
            background: none;
            border: none;
            word-break: break-all;
            resize: none;
          }
          .headers {
            @p: .bgDarkestBlue, .pa25, .flexAuto;
          }
          .row {
            @p: .flex, .mb10, .pointer;
            height: 20px;
          }
          .row:hover:after {
            @p: .white, .fw7, .ml6;
            content: "×";
          }
          .name {
            @p: .white, .fw6, .f14;
            min-width: 120px;
          }
          .value {
            @p: .white, .f14;
          }
          .add-row-inactive {
            @p: .f14, .white40, .mt12, .pointer;
          }
          .ok {
            @p: .bgLightgreen20, .br100, .flex, .itemsCenter, .justifyCenter, .ml16, .pointer;
            width: 25px;
            height: 25px;
          }
          .new-row {
            @p: .flex, .overflowHidden, .br2;
          }
          .left, .right {
            @p: .pv10, .ph12;
          }
          .left {
            @p: .bgWhite;
          }
          .right {
            @p: .br2, .brRight;
            background: rgb(245, 245, 245);
          }
          input {
            @p: .f14;
            background: none;
          }
          .name-input {
            @p: .blue;
          }
          .value-input {
            @p: .black80;
          }
          .right {
            @p: .flex, .itemsCenter;
          }
        `}</style>
        <textarea
          autoFocus
          rows={2}
          onChange={this.urlChange}
          onKeyDown={this.keyDown}
          placeholder='Paste your webhook url here…'
          value={url}
        />
        <div className='headers'>
          {headers && Object.keys(headers).map(name => (
            <div className='row' onClick={() => this.removeRow(name)}>
              <div className='name'>{name}</div>
              <div className='value'>{headers[name]}</div>
            </div>
          ))}
          {!addingRow ? (
            <div className='add-row-inactive' onClick={this.toggleAddRow}>+ add HTTP Header</div>
          ) : (
            <div className='new-row'>
              <div className='left'>
                <input
                  type='text'
                  className='name-input'
                  placeholder='Type a name ...'
                  autoFocus
                  value={this.state.currentName}
                  onChange={this.onChangeName}
                />
              </div>
              <div className='right'>
                <input
                  type='text'
                  className='value-input'
                  placeholder='Type the content ...'
                  value={this.state.currentValue}
                  onChange={this.onChangeValue}
                  onKeyDown={this.valueKeyDown}
                />
                <div className='ok' onClick={this.addRow}>
                  <Icon src={require('graphcool-styles/icons/fill/check.svg')} color={$v.green} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  private setRef = ref => {
    this.ref = ref
  }

  private scrollDown = () => {
    if (this.ref) {
      const target = this.ref.scrollHeight - this.ref.clientHeight
      smoothScrollTo(this.ref, target, 50)
    }
  }

  private removeRow = (name: string) => {
    const copy = Object.assign({}, this.props.headers)
    delete copy[name]
    this.props.onChangeHeaders(copy)
  }

  private addRow = () => {
    const {currentName, currentValue} = this.state
    this.props.onChangeHeaders({
      ...this.props.headers,
      [currentName]: currentValue,
    })
    this.setState({
      currentName: '',
      currentValue: '',
    } as State)
  }

  private toggleAddRow = e => {
    this.setState(state => {
      return {
        ...state,
        addingRow: !state.addingRow,
      }
    })
  }

  private onChangeName = e => {
    this.setState({currentName: e.target.value} as State)
  }

  private onChangeValue = e => {
    this.setState({currentValue: e.target.value} as State)
  }

  private urlChange = e => {
    this.props.onChangeUrl(e.target.value)
  }

  private valueKeyDown = e => {
    if (e.keyCode === 13) {
      this.addRow()
    }
  }

  private keyDown = e => {
    if (e.keyCode === 13) {
      e.preventDefault()
      e.stopPropagation()
    }
  }
}
