import * as React from 'react'
import { Icon, $v } from 'graphcool-styles'
import * as cookiestore from 'cookiestore'
import Left from './Left'
import Right from './Right'
import Loading from '../../../components/Loading/Loading'
import { AuthTrigger } from '../types'
import { updateNetworkLayer } from '../../../utils/relay'

interface State {
  loading: boolean
}

interface Props {
  location: any
}

const updateAuth = async (cliToken: string) => {
  await fetch(`${__CLI_AUTH_TOKEN_ENDPOINT__}/update`, {
    method: 'POST',
    body: JSON.stringify({
      authToken: cookiestore.get('graphcool_auth_token'),
      cliToken,
    }),
  })

  updateNetworkLayer()
}

const redirectURL = (authTrigger: AuthTrigger): string => {
  switch (authTrigger) {
    case 'auth':
      return `/cli/auth/success`
    case 'init':
      return `/cli/auth/success-init`
    case 'quickstart':
      return `https://www.graph.cool/docs/quickstart`
  }
}

export default class CLIAuthView extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      loading: props.location.hash.length > 1,
    }
  }

  // used from routes as `onEnter` hook
  static routeRedirectWhenAuthenticated = async (nextState, replace, cb) => {
    if (cookiestore.has('graphcool_auth_token')) {
      const {authTrigger, cliToken} = nextState.location.query

      await updateAuth(cliToken)

      const redirect = redirectURL(authTrigger)
      if (redirect.startsWith('http')) {
        window.location.href = redirect
      } else {
        replace(redirect)
        cb()
      }
    } else {
      cb()
    }
  }

  render() {
    console.log(this.props)
    const {authTrigger, cliToken} = this.props.location.query

    return (
      <div className='cli-auth-view'>
        <style jsx={true}>{`

          .cli-auth-view {
            @p: .w100, .fixed, .top0, .left0, .right0, .bottom0, .flex, .itemsCenter, .justifyCenter, .white;
            background-image: radial-gradient(circle at 49% 49%, #172a3a, #0f202d);
          }

          .logo {
            @p: .absolute, .left0, .top0, .pl60, .pt60;
          }

        `}</style>
        <div className='logo'>
          <Icon
            color={$v.green}
            width={34}
            height={40}
            src={require('../../../assets/icons/logo.svg')}
          />
        </div>
        {this.state.loading &&
        <Loading color='#fff'/>
        }
        {!this.state.loading &&
        <Left className='mr60'/>
        }
        <Right
          loading={this.state.loading}
          updateAuth={updateAuth}
          redirectUrl={redirectURL(authTrigger)}
          cliToken={cliToken}
        />
      </div>
    )
  }
}
