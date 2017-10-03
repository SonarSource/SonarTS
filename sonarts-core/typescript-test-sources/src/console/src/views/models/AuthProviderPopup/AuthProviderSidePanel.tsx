import * as React from 'react'
import * as Relay from 'react-relay'
import * as Immutable from 'immutable'
import FloatingInput from '../../../components/FloatingInput/FloatingInput'
import UpdateAuthProviderMutation from '../../../mutations/UpdateAuthProviderMutation'
import {connect} from 'react-redux'
import {onFailureShowNotification} from '../../../utils/relay'
import {showNotification} from '../../../actions/notification'
import {bindActionCreators} from 'redux'
import {Project, AuthProvider, AuthProviderType, Model, PackageDefinition} from '../../../types/types'
import {ShowNotificationCallback} from '../../../types/utils'
import * as cx from 'classnames'
import {$p} from 'graphcool-styles'
import tracker from '../../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'
import InstallPackage from '../../../mutations/Packages/InstallPackage'
import getAnonymousPackage from './auth'
import mapProps from '../../../components/MapProps/MapProps'
import UninstallPackage from '../../../mutations/Packages/UninstallPackage'

interface Props {
  selectedType: AuthProviderType
  project: Project
  showNotification: ShowNotificationCallback
  forceFetchRoot: () => void
  anonymousPackage: PackageDefinition
}

interface AuthProviderErrors {
  auth0: {
    clientId: boolean
    domain: boolean
    clientSecret: boolean,
  }
  digits: {
    consumerKey: boolean
    consumerSecret: boolean,
  }
}

interface State {
  authProvider: AuthProvider
  errors: AuthProviderErrors
  hasChanged: boolean
  selectedAnonymousModel: string
}

class AuthProviderSidePanel extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    const firstModel = props.project.models.edges[0].node

    this.state = {
      authProvider: this.getAuthProvider(props),
      hasChanged: false,
      errors: this.initErrors(),
      selectedAnonymousModel: props.anonymousPackage ?
        this.getSelectedType(props.anonymousPackage.definition) : firstModel.name,
    }
    global['a'] = this
  }

  componentWillReceiveProps(props: Props) {
    this.setState({
      authProvider: this.getAuthProvider(props),
      hasChanged: false,
    } as State)
  }

  render() {
    const {authProvider, errors} = this.state
    const text = texts[this.props.selectedType]

    return (
      <div className='flex flex-column justify-between w-100'>
        <div className='flex flex-column'>
          <div className='w-100 white pa-25 fw1 bg-black-80 relative'>
            {authProvider.isEnabled &&
              <div
                className='absolute pa-6 bg-accent white ttu br-1 fw5'
                style={{ top: 16, right: 16, background: '#7ED321', fontSize: 14 }}
              >
                Active
              </div>
            }
            <div className='f-25 b'>
              {text.title}
            </div>
            <div className='f-16 mv-16'>
              {text.description}
            </div>
            <div className='f-16'>
              <a target='_blank' href={text.link.href} className='white underline'>
                {text.link.content}
              </a>
            </div>
          </div>
          {authProvider.type === 'AUTH_PROVIDER_EMAIL' &&
          <div className='flex w-100 bg-black-70 justify-between white pa-25'>
            <div className='w-30 pr2 flex flex-column'>
              <div className='b mb-16 white-50'>
                Generated Fields
              </div>
              <div>
                <span className='pa-6 mb-10 br-2 dib bg-white-10' style={{ fontSize: 13 }}>
                  email
                </span>
              </div>
              <div>
                <span className='pa-6 mb-10 br-2 dib bg-white-10' style={{ fontSize: 13 }}>
                  password
                </span>
              </div>
            </div>
            <div className='w-70 flex flex-column'>
              <div className='b mb-16 white-50'>
                Generated Mutations
              </div>
              <div>
              <span className='pa-6 mb-10 br-2 dib bg-white-10' style={{ fontSize: 13 }}>
                {`createUser(authProvider: { email: { email, password } })`}
              </span>
              </div>
              <div>
              <span className='pa-6 mb-10 br-2 dib bg-white-10' style={{ fontSize: 13 }}>
                {`signinUser(email: { email, password })`}
              </span>
              </div>
            </div>
          </div>
          }
          {authProvider.type === 'anonymous-auth-provider' &&
            <div className='flex w-100 bg-black-70 justify-between white pa-25'>
              <div className='w-30 pr2 flex flex-column'>
                <div className='b mb-16 white-50'>
                  Generated Fields
                </div>
                <div>
                    <span className='pa-6 mb-10 br-2 dib bg-white-10' style={{ fontSize: 13 }}>
                      secret
                    </span>
                </div>
              </div>
              <div className='w-70 flex flex-column'>
                <div className='b mb-16 white-50'>
                  Generated Mutations
                </div>
                <div>
                  <span className='pa-6 mb-10 br-2 dib bg-white-10' style={{ fontSize: 13 }}>
                    {`authenticateAnonymous${this.state.selectedAnonymousModel}(secret: String!)`}
                  </span>
                </div>
              </div>
            </div>
          }
          {authProvider.type === 'anonymous-auth-provider' && (
            <div className='pa-25 flex flex-column fw1'>
              <style jsx={true}>{`
                .btn {
                  @p: .ph16, .pv10, .br2, .bgGreen, .white, .f16, .pointer, .dib;
                }
              `}</style>
              <span>Select the Type the Secret should be added to</span>
            <div className='flex items-center mt-25 justify-between'>
                <select onChange={this.handleAnonymousTypeChange} value={this.state.selectedAnonymousModel}>
                  {this.props.project.models.edges.map(edge => (
                    <option value={edge.node.name}>{edge.node.name}</option>
                  ))}
                </select>
                {authProvider.isEnabled && (
                  <div className='btn' onClick={this.updateAnonymousAuthProvider}>Update Type</div>
                )}
              </div>
            </div>
          )}
          {authProvider.type === 'AUTH_PROVIDER_DIGITS' &&
            <div className='flex w-100 bg-black-70 justify-between white pa-25'>
              <div className='w-30 pr2 flex flex-column'>
                <div className='b mb-16 white-50'>
                  Generated Fields
                </div>
                <div>
                  <span className='pa-6 mb-10 br-2 dib bg-white-10' style={{ fontSize: 13 }}>
                    digitsId
                  </span>
                </div>
              </div>
              <div className='w-70 flex flex-column'>
                <div className='b mb-16 white-50'>
                  Generated Mutations
                </div>
                <div>
                  <span className='pa-6 mb-10 br-2 dib bg-white-10' style={{ fontSize: 13 }}>
                    {`createUser(authProvider: { digits: { apiUrl, credentials } })`}
                  </span>
                </div>
                <div>
                  <span className='pa-6 mb-10 br-2 dib bg-white-10' style={{ fontSize: 13 }}>
                    {`signinUser(digits: { apiUrl, credentials })`}
                  </span>
                </div>
              </div>
            </div>
          }
          {authProvider.type === 'AUTH_PROVIDER_DIGITS' &&
            <div className='pa-25 flex flex-column fw1'>
              <FloatingInput
                labelClassName='f-25 pa-16 black-50'
                className='pa-16 bg-black-05 br-2 bn mb-10 f-25'
                label='Consumer Key'
                placeholder='xxxxxxxxxxxxx'
                value={authProvider.digits!.consumerKey}
                onChange={(e: any) => this.setIn(['digits', 'consumerKey'], e.target.value)}
                onKeyDown={e => e.keyCode === 13 && this.enable()}
              />
              {errors.digits.consumerKey &&
                <div className={cx($p.f12, $p.orange)}>The Consumer Key is required</div>
              }
              <FloatingInput
                labelClassName='f-25 pa-16 black-50'
                className='pa-16 bg-black-05 br-2 bn f-25'
                label='Consumer Secret'
                placeholder='xxxxxxxxxxxxx'
                value={authProvider.digits!.consumerSecret}
                onChange={(e: any) => this.setIn(['digits', 'consumerSecret'], e.target.value)}
                onKeyDown={e => e.keyCode === 13 && this.enable()}
              />
              {errors.digits.consumerSecret &&
                <div className={cx($p.f12, $p.orange)}>The Consumer Secret is required</div>
              }
            </div>
          }
          {authProvider.type === 'AUTH_PROVIDER_AUTH0' &&
          <div className='flex w-100 bg-black-70 justify-between white pa-25'>
            <div className='w-30 pr2 flex flex-column'>
              <div className='b mb-16 white-50'>
                Generated Fields
              </div>
              <div>
                <span className='pa-6 mb-10 br-2 dib bg-white-10' style={{ fontSize: 13 }}>
                  auth0UserId
                </span>
              </div>
            </div>
            <div className='w-70 flex flex-column'>
              <div className='b mb-16 white-50'>
                Generated Mutations
              </div>
              <div>
                <span className='pa-6 mb-10 br-2 dib bg-white-10' style={{ fontSize: 13 }}>
                  {`createUser(authProvider: { auth0: { idToken } })`}
                </span>
              </div>
            </div>
          </div>
          }
          {authProvider.type === 'AUTH_PROVIDER_AUTH0' &&
          <div className='pa-38 flex flex-column'>
            <FloatingInput
              labelClassName='f-25 pa-16 black-50'
              className='pa-16 bg-black-05 br-2 bn mb-10 f-25'
              label='Domain'
              placeholder='xxxxxxxxxxxxx'
              value={authProvider.auth0!.domain}
              onChange={(e: any) => this.setIn(['auth0', 'domain'], e.target.value)}
              onKeyDown={e => e.keyCode === 13 && this.enable()}
            />
            {errors.auth0.domain &&
            <div className={cx($p.f12, $p.orange)}>The Domain is required</div>
            }
            <FloatingInput
              labelClassName='f-25 pa-16 black-50'
              className='pa-16 bg-black-05 br-2 bn mb-10 f-25'
              label='Client Id'
              placeholder='xxxxxxxxxxxxx'
              value={authProvider.auth0!.clientId}
              onChange={(e: any) => this.setIn(['auth0', 'clientId'], e.target.value)}
              onKeyDown={e => e.keyCode === 13 && this.enable()}
            />
            {errors.auth0.clientId &&
            <div className={cx($p.f12, $p.orange)}>The Client ID is required</div>
            }
            <FloatingInput
              labelClassName='f-25 pa-16 black-50'
              className='pa-16 bg-black-05 br-2 bn mb-10 f-25'
              label='Client Secret'
              placeholder='xxxxxxxxxxxxx'
              value={authProvider.auth0!.clientSecret}
              onChange={(e: any) => this.setIn(['auth0', 'clientSecret'], e.target.value)}
              onKeyDown={e => e.keyCode === 13 && this.enable()}
            />
            {errors.auth0.clientSecret &&
            <div className={cx($p.f12, $p.orange)}>The Client Secret is required</div>
            }
          </div>
          }
        </div>
        <div className='flex justify-between pa-25 bt b--light-gray'>
          {authProvider.isEnabled &&
            <div
              className='ph-25 pv-16 f-25 white pointer'
              style={{
                backgroundColor: '#F5A623',
              }}
              onClick={this.disable}
            >
              Disable
            </div>
          }
          {!authProvider.isEnabled &&
            <div className='ph-25 pv-16 f-25 white bg-accent pointer' onClick={this.enable}>
              Enable
            </div>
          }
          {authProvider.isEnabled && this.state.hasChanged &&
            <div className='ph-25 pv-16 f-25 white bg-accent pointer' onClick={this.enable}>
              Update
            </div>
          }
        </div>
      </div>
    )
  }

  private handleAnonymousTypeChange = e => {
    this.setState({selectedAnonymousModel: e.target.value} as State)
  }

  private initErrors = () => {
    return {
      auth0: {
        clientId: false,
        domain: false,
        clientSecret: false,
      },
      digits: {
        consumerKey: false,
        consumerSecret: false,
      },
    }
  }

  private validateAuthProvider = () => {
    const {type, digits, auth0} = this.state.authProvider

    let errors = this.initErrors()
    let valid = true

    if (type === 'AUTH_PROVIDER_DIGITS') {
      if (!digits.consumerKey || digits.consumerKey.length === 0) {
        errors.digits.consumerKey = true
        valid = false
      }
      if (!digits.consumerSecret || digits.consumerSecret.length === 0) {
        errors.digits.consumerSecret = true
        valid = false
      }
    }

    if (type === 'AUTH_PROVIDER_AUTH0') {
      if (!auth0.domain || auth0.domain.length === 0) {
        errors.auth0.domain = true
        valid = false
      }
      if (!auth0.clientId || auth0.clientId.length === 0) {
        errors.auth0.clientId = true
        valid = false
      }
      if (!auth0.clientSecret || auth0.clientSecret.length === 0) {
        errors.auth0.clientSecret = true
        valid = false
      }
    }

    this.setState({errors} as State)

    return valid
  }

  private setIn = (keyPath: string[], value: any): void => {
    this.setState({
      authProvider: Immutable.fromJS(this.state.authProvider).setIn(keyPath, value).toJS(),
      hasChanged: true,
    } as State)
  }

  private getAuthProvider(props: Props): AuthProvider {
    if (props.selectedType === 'anonymous-auth-provider') {
      return {
        id: 'anonymous-auth-provider',
        type: 'anonymous-auth-provider',
        isEnabled: Boolean(this.props.anonymousPackage),
        digits: null,
        auth0: null,
      }
    }
    return props.project.authProviders.edges.map(e => e.node).find(a => a.type === props.selectedType)!
  }

  private getSelectedType(definition) {
    const line = definition.split('\n').find(line => line.includes('onType:'))
    if (line) {
      const regex = /.+?:\s{0,1}(.+)/
      const result = regex.exec(line)
      if (result) {
        return result[1]
      } else {
        return null
      }
    }
    return null
  }

  private enable = () => {
    if (!this.validateAuthProvider()) {
      return
    }

    tracker.track(ConsoleEvents.AuthProvider.Popup.dataEntered())
    tracker.track(ConsoleEvents.AuthProvider.Popup.toggled())
    this.setState(
      {
        authProvider: Immutable.fromJS(this.state.authProvider).set('isEnabled', true).toJS(),
      } as State,
      this.update,
    )
  }

  private disable = () => {
    graphcoolConfirm('You\'re disabling an Auth Provider. It will delete all auth provider related data.')
      .then(() => {
        tracker.track(ConsoleEvents.AuthProvider.Popup.toggled())
        this.setState(
          {
            authProvider: Immutable.fromJS(this.state.authProvider).set('isEnabled', false).toJS(),
          } as State,
          this.update,
        )
      })
  }

  private update = () => {
    const {authProvider} = this.state
    if (authProvider.type === 'anonymous-auth-provider') {
      return this.updateAnonymousAuthProvider()
    }
    Relay.Store.commitUpdate(
      new UpdateAuthProviderMutation({
        authProviderId: authProvider.id,
        isEnabled: authProvider.isEnabled,
        digits: authProvider.digits,
        auth0: authProvider.auth0,
      }),
      {
        onSuccess: () => {
          // The force fetching because authproviders are too complicated to selective choose the config
          // forceFetchRoot gets passed down from StuctureView/DatabrowserView
          // which is needed to reflect all affected data
          this.props.forceFetchRoot()
        },
        onFailure: (transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
        },
      },
    )
  }

  private uninstallAnonymousAuthProvider() {
    return new Promise((resolve, reject) => {
      Relay.Store.commitUpdate(
        new UninstallPackage({
          projectId: this.props.project.id,
          name: 'anonymous-auth-provider',
        }),
        {
          onSuccess: (res) => {
            // The force fetching because authproviders are too complicated to selective choose the config
            // forceFetchRoot gets passed down from StuctureView/DatabrowserView
            // which is needed to reflect all affected data
            console.log('Uninstalled Package', res)
            // this.props.forceFetchRoot()
            resolve(res)
          },
          onFailure: (transaction) => {
            reject(transaction)
            onFailureShowNotification(transaction, this.props.showNotification)
          },
        },
      )
    })
  }

  private updateAnonymousAuthProvider = () => {
    const {authProvider, selectedAnonymousModel} = this.state
    const {isEnabled} = authProvider

    const hack = () => {
      if (isEnabled) {
        const definition = getAnonymousPackage(this.state.selectedAnonymousModel)

        Relay.Store.commitUpdate(
          new InstallPackage({
            projectId: this.props.project.id,
            definition,
          }),
          {
            onSuccess: (res) => {
              // The force fetching because authproviders are too complicated to selective choose the config
              // forceFetchRoot gets passed down from StuctureView/DatabrowserView
              // which is needed to reflect all affected data
              console.log('Installed Package', res)
              this.props.forceFetchRoot()
            },
            onFailure: (transaction) => {
              onFailureShowNotification(transaction, this.props.showNotification)
            },
          },
        )
      } else {
        this.uninstallAnonymousAuthProvider()
          .then(() => {
            this.props.forceFetchRoot()
          })
      }
    }
    if (this.props.anonymousPackage) {
      this.uninstallAnonymousAuthProvider()
        .then(hack)
    } else {
      hack()
    }
  }
}

const MappedAuthProviderSidePanel = mapProps({
  anonymousPackage: props => {
    return props.project.packageDefinitions.edges
      .map(edge => edge.node)
      .find(node => node.name === 'anonymous-auth-provider')
  },
})(AuthProviderSidePanel)

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({showNotification}, dispatch)
}

export default Relay.createContainer(connect(null, mapDispatchToProps)(MappedAuthProviderSidePanel), {
    fragments: {
        project: () => Relay.QL`
          fragment on Project {
            id
            models(first: 100) {
              edges {
                node {
                  id
                  name
                }
              }
            }
            packageDefinitions(first: 100) {
              edges {
                node {
                  id
                  definition
                  name
                }
              }
            }
            authProviders(first: 100) {
              edges {
                node {
                  id
                  type
                  isEnabled
                  digits {
                    consumerKey
                    consumerSecret
                  }
                  auth0 {
                    clientId
                    clientSecret
                    domain
                  }
                }
              }
            }
          }
        `,
    },
})

interface AuthText {
  title: string
  description: string
  link: {
    href: string
    content: string,
  }
}

const texts: {[key: string]: AuthText} = {
  AUTH_PROVIDER_EMAIL: {
    title: 'Graphcool Email + Password',
    description: 'Use our built-in auth system that authenticates users with email and password',
    link: {
      href: 'https://graph.cool/docs/reference/platform/authentication-wejileech9',
      content: 'graph.cool/docs',
    },
  },
  AUTH_PROVIDER_DIGITS: {
    title: 'Digits - Two-Step Phone Authentication',
    description: 'Digits offers two-step authentification via a phone number and a code that is send to respective number.', // tslint:disable-line
    link: {
      href: 'https://www.digits.com',
      content: 'www.digits.com',
    },
  },
  AUTH_PROVIDER_AUTH0: {
    title: 'Auth0 – Broad Authentication Solution',
    description: 'Auth0 combines a variety of authentification methods and a dashboard to organize them.',
    link: {
      href: 'https://www.auth0.com',
      content: 'www.auth0.com',
    },
  },
  'anonymous-auth-provider': {
    title: 'Graphcool Anonymous Auth',
    description: 'The anonymous auth provider can be used if you need temporary sessions.',
    link: {
      href: 'https://graph.cool/docs/reference/platform/authentication-wejileech9',
      content: 'graph.cool/docs',
    },
  },
}
