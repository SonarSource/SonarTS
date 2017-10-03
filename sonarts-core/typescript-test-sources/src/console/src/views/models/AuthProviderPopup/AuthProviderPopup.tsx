import * as React from 'react'
import * as Relay from 'react-relay'
import AuthProviderSidePanel from './AuthProviderSidePanel'
import {Icon} from 'graphcool-styles'
import { $p } from 'graphcool-styles'
import * as cx from 'classnames'
import { Project, AuthProviderType } from '../../../types/types'
import tracker from '../../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'
import PopupWrapper from '../../../components/PopupWrapper/PopupWrapper'
import mapProps from '../../../components/MapProps/MapProps'
import {withRouter} from 'react-router'

interface Props {
  project: Project
  forceFetchRoot: () => void
  params: any
  location: any
  router: ReactRouter.InjectedRouter
  isBeta: boolean
}

const urlToType = {
  digits: 'AUTH_PROVIDER_DIGITS',
  email: 'AUTH_PROVIDER_EMAIL',
  auth0: 'AUTH_PROVIDER_AUTH0',
  anonymous: 'anonymous-auth-provider',
}

class AuthProviderPopup extends React.Component<Props, null> {

  componentWillMount() {
    if (!this.props.params.provider || this.props.params.provider.length === 0) {
      this.props.router.push('email')
    }
  }

  componentDidMount() {
    tracker.track(ConsoleEvents.AuthProvider.Popup.opened({source: 'user-model'}))
  }

  render() {
    const authProviders = this.props.project.authProviders.edges.map(edge => edge.node)
    const selectedType = this.props.params.provider || 'email'
    const {projectName} = this.props.params
    return (
      <PopupWrapper onClickOutside={this.close}>
        <div
          className={cx($p.flex, $p.justifyCenter, $p.itemsCenter, $p.h100, $p.w100, $p.bgWhite50)}
          style={{ pointerEvents: 'all' }}
        >
          <div
            className={cx($p.bgWhite, $p.br2, $p.buttonShadow, $p.overflowYScroll)}
            style={{ width: 900, maxHeight: '100vh' }}
          >
            <div className={cx($p.bgGreen, $p.flex, $p.justifyBetween, $p.itemsCenter, $p.white, $p.pa25)}>
              <div className={cx($p.f38, $p.fw3)}>
                Auth Providers
              </div>
              <div className={$p.pointer} onClick={this.close}>
                <Icon
                  src={require('assets/icons/close.svg')}
                  width={40}
                  height={40}
                  color='white'
                />
              </div>
            </div>
            <div className={cx($p.flex, $p.justifyBetween)}>
              <div className={cx($p.flex, $p.flexColumn, $p.br, $p.bBlack10)} style={{ flex: '0 0 270px' }}>
                <div
                  className={cx(
                    $p.flex, $p.pa25, $p.bb, $p.bBlack10, $p.itemsCenter, $p.pointer, $p.justifyBetween,
                    selectedType === 'email' && $p.bgBlack04,
                  )}
                  onClick={() => {
                    this.props.router.push(`/${projectName}/integrations/authentication/email`)
                    tracker.track(ConsoleEvents.AuthProvider.Popup.providerSelected())
                  }}
                >
                  <div className={cx($p.flex, $p.itemsCenter)}>
                    <Icon
                      src={require('assets/icons/logo.svg')}
                      width={40}
                      height={40}
                      color='#00B861'
                    />
                    <div className={cx($p.fw3, $p.f25, $p.ml16)}>
                      Email
                    </div>
                  </div>
                  <div>
                    {authProviders.find(a => a.type === 'AUTH_PROVIDER_EMAIL' && a.isEnabled) &&
                      <Icon src={require('assets/new_icons/check.svg')} color='#7ED321'/>
                    }
                  </div>
                </div>
                <div
                  className={cx(
                    $p.flex, $p.pa25, $p.bb, $p.bBlack10, $p.itemsCenter, $p.pointer, $p.justifyBetween,
                    selectedType === 'anonymous' && $p.bgBlack04,
                  )}
                  onClick={() => {
                    this.props.router.push(`/${projectName}/integrations/authentication/anonymous`)
                  }}
                >
                  <div className={cx($p.flex, $p.itemsCenter)}>
                    <Icon
                      src={require('assets/icons/logo.svg')}
                      width={40}
                      height={40}
                      color='#00B861'
                    />
                    <div className={cx($p.fw3, $p.f25, $p.ml16)}>
                      Anonymous
                    </div>
                  </div>
                  <div>
                    {false &&
                      <Icon src={require('assets/new_icons/check.svg')} color='#7ED321'/>
                    }
                  </div>
                </div>
                <div
                  className={cx(
                    $p.flex, $p.pa25, $p.bb, $p.bBlack10, $p.itemsCenter, $p.pointer, $p.justifyBetween,
                    selectedType === 'digits' && $p.bgBlack04,
                  )}
                  onClick={() => {
                    this.props.router.push(`/${projectName}/integrations/authentication/digits`)
                    tracker.track(ConsoleEvents.AuthProvider.Popup.providerSelected())
                  }}
                >
                  <img src={require('assets/graphics/digits.png')}/>
                  <div>
                    {authProviders.find(a => a.type === 'AUTH_PROVIDER_DIGITS' && a.isEnabled) &&
                    <Icon src={require('assets/new_icons/check.svg')} color='#7ED321'/>
                    }
                  </div>
                </div>
                <div
                  className={cx(
                    $p.flex, $p.pa25, $p.bb, $p.bBlack10, $p.itemsCenter, $p.pointer, $p.justifyBetween,
                    selectedType === 'auth0' && $p.bgBlack04,
                  )}
                  onClick={() => {
                    this.props.router.push(`/${projectName}/integrations/authentication/auth0`)
                    tracker.track(ConsoleEvents.AuthProvider.Popup.providerSelected())
                  }}
                >
                  <img src={require('assets/graphics/auth0-logo-blue.svg')}/>
                  <div>
                    {authProviders.find(a => a.type === 'AUTH_PROVIDER_AUTH0' && a.isEnabled) &&
                      <Icon src={require('assets/new_icons/check.svg')} color='#7ED321'/>
                    }
                  </div>
                </div>
              </div>
              <AuthProviderSidePanel
                project={this.props.project}
                selectedType={urlToType[selectedType]}
                forceFetchRoot={location.reload.bind(location)}
              />
            </div>
          </div>
        </div>
      </PopupWrapper>
    )
  }

  private close = () => {
    // TODO
    if (this.props.location.state && this.props.location.state.returnTo) {
      this.props.router.push(this.props.location.state.returnTo)
    } else {
      this.props.router.push(`/${this.props.params.projectName}/integrations`)
    }
  }
}

const MappedAuthProviderPopup = mapProps({
  project: props => props.viewer.project,
  isBeta: props => props.viewer.user.crm.information.isBeta,
})(withRouter(AuthProviderPopup))

export default Relay.createContainer(MappedAuthProviderPopup, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          authProviders(first: 100) {
            edges {
              node {
                type
                isEnabled
              }
            }
          }
          ${AuthProviderSidePanel.getFragment('project')}
        }
        user {
          crm {
            information {
              isBeta
            }
          }
        }
      }
    `,
  },
})
