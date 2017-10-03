import * as React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {ReduxAction} from '../../types/reducers'
import {closePopup} from '../../actions/popup'
import styled, {keyframes} from 'styled-components'
import {$p, variables, Icon} from 'graphcool-styles'
import CopyToClipboard from 'react-copy-to-clipboard'
import * as cx from 'classnames'
import tracker from '../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'
import getSubscriptionEndpoint from '../../utils/region'

interface Props {
  id: string
  projectId: string
  closePopup: (id: string) => ReduxAction
  alias: string
  region: string
}

interface State {
  endpoint: Endpoint
  copied: boolean
}

type Endpoint = 'simple/v1' | 'relay/v1' | 'file/v1' | 'subscription/v1'

class EndpointPopup extends React.Component<Props, State> {

  state = {
    endpoint: 'simple/v1' as Endpoint,
    copied: false,
  }

  copyTimer: number

  componentWillUnmount() {
    clearTimeout(this.copyTimer)
  }

  componentDidMount() {
    tracker.track(ConsoleEvents.Endpoints.opened())
  }

  render() {

    const Popup = styled.div`
      width: 600px;
      max-width: 90%;
    `

    const Separator = styled.div`

      position: relative;
      display: flex;
      justify-content: center;

      &:before {
        content: "";
        position: absolute;
        left: 0;
        width: 100%;
        height: 1px;
        top: 50%;
        background: ${variables.gray10};
      }
    `

    const activeEndpointType = `
      background: ${variables.green};
      padding: 12px;
      border-radius: 2px;
      cursor: default;
      color: ${variables.white};

      &:hover {
        color: ${variables.white};
        background: ${variables.green};
      }
    `

    const EndpointType = styled.div`
      background: ${variables.gray07};
      padding: ${variables.size10};
      color: ${variables.gray30};
      letter-spacing: 1px;
      cursor: pointer;
      transition: color ${variables.duration} linear, background ${variables.duration} linear;

      &:first-child {
        border-top-left-radius: 2px;
        border-bottom-right-radius: 2px;
      }

      &:last-child {
        border-top-right-radius: 2px;
        border-bottom-right-radius: 2px;
      }

      &:hover {
        background: ${variables.gray10};
        color: ${variables.gray50};
      }

     ${props => props.active && activeEndpointType}
    `

    const EndpointField = styled.div`
      &:after {
        content: "";
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        background: linear-gradient(to left, ${variables.white} 0%, rgba(255,255,255,0) 80%);
        width: 25px;
      }
    `

    const Copy = styled.div`
      i {
        transition: fill ${variables.duration} linear, background ${variables.duration} linear;
      }

      &:hover {
        i {
          background: ${variables.gray04};
          fill: ${variables.gray60};
        }
      }
    `

    const movingCopyIndicator = keyframes`
      0% {
        opacity: 0;
        transform: translate(-50%, 0);
      }

      50% {
        opacity: 1;
      }

      100% {
        opacity: 0;
        transform: translate(-50%, -50px);
      }
    `

    const CopyIndicator = styled.div`
      top: -20px;
      left: 50%;
      transform: translate(-50%,0);
      animation: ${movingCopyIndicator} .7s linear
    `

    const {endpoint, copied} = this.state
    const {projectId, alias, region} = this.props

    const aliasOrId = (alias && alias.length > 0) ? alias : projectId

    let url = `https://api.graph.cool/${endpoint}/${aliasOrId}`
    if (endpoint.includes('subscription')) {
      url = getSubscriptionEndpoint(region) + `/v1/${aliasOrId}`
    }

    return (
      <div
        className={cx(
          $p.flex,
          $p.bgBlack50,
          $p.w100,
          $p.h100,
          $p.justifyCenter,
          $p.itemsCenter,
        )}
      >
        <Popup className={cx($p.bgWhite, $p.br2)} style={{pointerEvents: 'all'}}>
          <header className={cx($p.relative, $p.pa60)}>
            <h1 className={cx($p.fw3, $p.f38, $p.tc)}>
              API Endpoints
            </h1>
            <div
              className={cx(
                $p.absolute,
                $p.pa25,
                $p.top0,
                $p.right0,
                $p.pointer,
              )}
              onClick={() => this.props.closePopup(this.props.id)}
            >
              <Icon
                width={25}
                height={25}
                color={variables.gray30}
                stroke
                strokeWidth={3}
                src={require('graphcool-styles/icons/stroke/cross.svg')}
              />
            </div>
          </header>
          <Separator>
            <div
              className={cx(
                $p.relative,
                $p.ph16,
                $p.bgWhite,
                $p.f14,
                $p.fw6,
                $p.ttu,
                $p.flex,
                $p.itemsCenter,
              )}
            >
              <EndpointType
                active={endpoint === 'relay/v1'}
                onClick={() => this.selectEndpoint('relay/v1')}
              >
                Relay
              </EndpointType>
              <EndpointType
                active={endpoint === 'simple/v1'}
                onClick={() => this.selectEndpoint('simple/v1')}
              >
                Simple
              </EndpointType>
              <EndpointType
                active={endpoint === 'file/v1'}
                onClick={() => this.selectEndpoint('file/v1')}
              >
                File
              </EndpointType>
              <EndpointType
                active={endpoint === 'subscription/v1'}
                onClick={() => this.selectEndpoint('subscription/v1')}
              >
                Subscriptions
              </EndpointType>
            </div>
          </Separator>
          <div className={cx($p.flex, $p.ph38)}>
            <EndpointField
              className={cx(
                $p.flexAuto,
                $p.f16,
                $p.fw3,
                $p.pv38,
                $p.overflowHidden,
                $p.relative,
              )}
            >
              {url}
            </EndpointField>
            <CopyToClipboard text={url}
                             onCopy={this.onCopy}>
              <Copy
                className={cx(
                  $p.relative,
                  $p.bgWhite,
                  $p.selfCenter,
                  $p.br2,
                  $p.buttonShadow,
                  $p.pointer,
                )}
              >
                {copied && (
                  <CopyIndicator
                    className={cx(
                      $p.o0,
                      $p.absolute,
                      $p.f14,
                      $p.fw6,
                      $p.blue,
                    )}
                  >
                    Copied
                  </CopyIndicator>
                )}
                <Icon
                  width={38}
                  height={38}
                  color={variables.gray50}
                  src={require('graphcool-styles/icons/fill/copy.svg')}
                />
              </Copy>
            </CopyToClipboard>
          </div>
          <p
            className={cx(
              $p.bt,
              $p.bBlack10,
              $p.pa38,
              $p.lhCopy,
              $p.black50,
            )}
          >
            {
              // tslint:disable-next-line
            }Please copy the endpoint URL and paste it into your app's GraphQL client code. You can <a className={$p.green} target='_blank' href='https://graph.cool/docs/reference/simple-api/overview-heshoov3ai#differences-to-the-relay-api'>read about the differences between the Simple and Relay API here</a> or <a className={$p.green} target='_blank' href='https://github.com/graphcool-examples'>check out some code examples</a>.
          </p>
        </Popup>
      </div>
    )
  }

  private selectEndpoint = (endpoint: Endpoint) => {
    tracker.track(ConsoleEvents.Endpoints.selected())
    this.setState({copied: false, endpoint} as State)
  }

  private onCopy: () => any = () => {
    tracker.track(ConsoleEvents.Endpoints.copied())
    this.setState({copied: true} as State)
    this.copyTimer = window.setTimeout(
      () => this.setState({copied: false} as State),
      1000,
    )
  }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({closePopup}, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EndpointPopup)
