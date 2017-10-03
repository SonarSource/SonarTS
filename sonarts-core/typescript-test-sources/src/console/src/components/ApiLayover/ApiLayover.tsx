import * as React from 'react'
import ClickOutside from 'react-click-outside'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Icon} from 'graphcool-styles'
const classes: any = require('./ApiLayover.scss')

type Endpoint = 'simple/v1' | 'relay/v1' | 'file/v1'

interface Props {
  projectId: string
  close: () => void
}

interface State {
  endpoint: Endpoint
  copied: boolean
}

export default class ApiLayover extends React.Component<Props, State> {

  state = {
    endpoint: 'simple/v1' as Endpoint,
    copied: false,
  }

  render() {
    const url = `https://api.graph.cool/${this.state.endpoint}/${this.props.projectId}`

    return (
      <ClickOutside onClickOutside={this.props.close}>
        <div className={classes.root}>
          <div className={classes.endpoints}>
            <select
              onChange={(e) => this.selectEndpoint((e.target as HTMLSelectElement).value as Endpoint)}
              ref='select'
            >
              <option>simple/v1</option>
              <option>relay/v1</option>
              <option>file/v1</option>
            </select>
            <Icon
              src={require('../../assets/icons/arrow.svg')}
            />
          </div>
          <div className={classes.url}>{url}</div>
          <CopyToClipboard text={url}
            onCopy={this.onCopy}>
            <span className={classes.copy}>
              {this.state.copied ? 'Copied' : 'Copy'}
            </span>
          </CopyToClipboard>
        </div>
      </ClickOutside>
    )
  }

  private onCopy = () => {
    this.setState({ copied: true } as State)
    setTimeout(this.props.close, 900)
  }

  private selectEndpoint = (endpoint: Endpoint) => {
    this.setState({ endpoint } as State)
  }
}
