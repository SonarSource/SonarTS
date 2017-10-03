import * as React from 'react'
import Auth0LockWrapper from '../../components/Auth0LockWrapper/Auth0LockWrapper'
import { Response } from '../../mutations/AuthenticateCustomerMutation'

interface Props {
  initialScreen: 'login' | 'signUp'
}

export default class AuthView extends React.Component<Props, {}> {

  render() {
    const successCallback = (response: Response) => {
      if (new Date().getTime() - new Date(response.user.createdAt).getTime() < 60000) {
        // this is a workaround instead of using the router to re-setup relay
        window.location.pathname = '/after-signup'
      } else {
        // this is a workaround instead of using the router to re-setup relay
        window.location.pathname = '/'
      }
    }

    return (
      <Auth0LockWrapper
        initialScreen={this.props.initialScreen}
        successCallback={successCallback}
        renderInElement={false}
      />
    )
  }
}
