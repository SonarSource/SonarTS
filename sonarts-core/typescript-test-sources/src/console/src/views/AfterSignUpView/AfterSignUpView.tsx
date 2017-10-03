import * as React from 'react'
import * as Relay from 'react-relay'
import { withRouter } from 'react-router'
import {$p, $v, Icon} from 'graphcool-styles'
import * as cx from 'classnames'
import styled, { keyframes } from 'styled-components'
import UpdateCustomerSourceMutation from '../../mutations/UpdateCustomerSourceMutation'
import * as cookiestore from 'cookiestore'
import {retryUntilDone} from '../../utils/utils'

const Container = styled.div`
  max-width: 750px;
`

const CustomInputWrapper = styled.div`
  width: 650px;
`

const CustomInput = styled.input`
  text-shadow: 0px 0px 0px #000;
  -webkit-text-fill-color: transparent;
  width: 620px;
  line-height: 1.5;
 
  &::-webkit-input-placeholder {
    color: ${$v.gray30};
    text-shadow: none;
    -webkit-text-fill-color: initial;
  }
`

const CommunicationIcon = styled(Icon)`
  g g path:first-child {
    fill: ${$v.gray30};
  }
`

const pulse = keyframes`
  0% { opacity: 1; }
  49% { opacity: 1; }
  50% { opacity: 0; }
  99% { opacity: 0; }
  100% { opacity: 1; }
`

const Caret = styled.div`
  height: 77px;
  width: 3px;
  background: ${$v.green};
  position: absolute;
  animation: ${pulse} 1s linear infinite;
  left: 0;
  top: -7px;
`

const WelcomeIcon = styled(Icon)`
  &:hover {
    svg {
      fill: ${$v.gray70};
    }
  }
`

interface Props {
  viewer: any
  router: ReactRouter.InjectedRouter
}

interface State {
  buttonActive: boolean
  source: string
}

class AfterSignUpView extends React.Component<Props, State> {

  activateTimeout: number

  constructor(props) {
    super(props)

    this.state = {
      buttonActive: false,
      source: props.viewer.user.crm.information.source,
    }
  }

  componentWillMount() {

    const {user: {crm: {information: {source}}}} = this.props.viewer
    if (source && source.length > 0) {
      // redirect to console, replace because customers shouldn't go back to this screen
      this.props.router.replace('/')
    }

  }

  componentDidMount() {
    this.activateTimeout = window.setTimeout(this.activateButton, 10000)

    retryUntilDone((done) => {
      if (window.Intercom) {
        Intercom('boot', {
          app_id: __INTERCOM_ID__,
          user_id: this.props.viewer.user.id,
          email: this.props.viewer.user.crm.information.email,
          name: this.props.viewer.user.crm.information.name,
        })
      }
    })
  }

  componentWillUnmount() {
    clearTimeout(this.activateTimeout)
  }

  render() {
    const {buttonActive, source} = this.state
    const {user: {name}} = this.props.viewer

    return (
      <div className={cx($p.flex, $p.itemsCenter, $p.justifyCenter)}>
        <Container className={cx($p.mt25)}>
          <div className={cx($p.f60, $p.tc)}>👋</div>
          <h1 className={cx($p.f38, $p.fw3, $p.tc)}>Hi {name.split(/\s/)[0]}!</h1>
          <p className={cx($p.fw3, $p.mt25, $p.tc)}>
            We appreciate you taking your time to get to know Graphcool.
            As frontend developers on our own, it’s the tool we always wanted for our self
            and therefore are very excited to have come this far.
          </p>
          <p className={cx($p.fw3, $p.mt25, $p.tc)}>
            As we are eager to learn and improve constantly we are depended on your feedback.
            If you ever get stuck or feel like there is room for improvement
            - shoot us a mail, hit us on slack or use the integrated chat,
            we will get back to you immediately.
          </p>
          <div className={cx($p.mv25, $p.w100, $p.flex, $p.justifyCenter)}>
            <div className={cx($p.flex, $p.flexRow, $p.justifyBetween, $p.itemsCenter, $p.w40)}>
              <a href='mailto:info@graph.cool' target='_blank'>
                <WelcomeIcon
                  width={48}
                  height={48}
                  src={require('graphcool-styles/icons/fill/welcomeEmail.svg')}
                  color={$v.gray30}
                  className={$p.pointer}
                />
              </a>
              <a href='https://slack.graph.cool' target='_blank'>
                <WelcomeIcon
                  width={48}
                  height={48}
                  src={require('graphcool-styles/icons/fill/welcomeSlack.svg')}
                  color={$v.gray30}
                  className={$p.pointer}
                />
              </a>
              <WelcomeIcon
                width={48}
                height={48}
                src={require('graphcool-styles/icons/fill/welcomeChat.svg')}
                color={$v.gray30}
                className={$p.pointer}
                onClick={this.openIntercom}
              />
            </div>
          </div>
          <div className={cx($p.w100, $p.bb, $p.bBlack10, $p.mv60)}></div>
          <div className={cx($p.f16, $p.fw3, $p.tc, $p.mt25)}>ONE LAST THING BEFORE WE GET STARTED</div>
          <div className={cx($p.flex, $p.justifyCenter)}>
            <CustomInputWrapper className={cx($p.relative, $p.flex, $p.justifyCenter, $p.mt25)}>
              {(!source || source.length === 0) && (
                <Caret />
              )}
              <CustomInput
                className={cx($p.f38, $p.fw3, $p.tl, (!source || source.length === 0) ? $p.white : $p.green)}
                placeholder='Would you tell us how you got here?'
                autoFocus
                value={source || ''}
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
                type='text'
              />
            </CustomInputWrapper>
          </div>
          <div className={cx($p.flex, $p.itemsCenter, $p.justifyCenter)}>
            <div
              className={cx(
                $p.white,
                $p.ttu,
                $p.f25,
                $p.pv16,
                $p.ph96,
                $p.tc,
                $p.mt60,
                $p.pointer,
                {
                  [`${$p.pointer} ${$p.bgGreen}`]: buttonActive,
                  [$p.bgBlack10]: !buttonActive,
                },
              )}
              onClick={this.gotoConsole}
            >
              Open Console
            </div>
          </div>
        </Container>
      </div>
    )

  }

  private openIntercom = () => {
    if (window.Intercom) {
      Intercom('show')
    }
  }

  private gotoConsole = () => {
    const {source} = this.state

    if (!this.state.buttonActive) {
      return
    }

    Relay.Store.commitUpdate(
      new UpdateCustomerSourceMutation({
        customerInformationId: this.props.viewer.user.crm.information.id,
        source: source,
        referral: cookiestore.get('graphcool_last_referral'),
      }),
      {
        onSuccess: () => {
          this.props.router.push('/')
        },
        onFailure: () => {
          this.props.router.push('/')
        },
      },
    )

  }

  private onChange = (e: any) => {
    this.setState({source: e.target.value} as State)

    if (!this.state.buttonActive) {
      this.activateButton()
    }
  }

  private onKeyDown = (e: any) => {
    if (e.keyCode === 13) {
      this.gotoConsole()
    }
  }

  private activateButton = () => {
    this.setState({buttonActive: true} as State)
  }
}

export default Relay.createContainer(withRouter(AfterSignUpView), {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        user {
          id
          name
          crm {
            information {
              id
              name
              email
              source
            }
          }
        }
      }
    `,
  },
})
