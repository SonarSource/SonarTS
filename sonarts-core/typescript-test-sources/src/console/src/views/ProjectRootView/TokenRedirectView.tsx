import * as React from 'react'
import { updateNetworkLayer } from '../../utils/relay'
import tracker from '../../utils/metrics'
import * as cookiestore from 'cookiestore'

interface Props {
  location: any
}

export default class TokenRedirectView extends React.Component<Props, {}> {

  componentWillMount () {
    const {query} = this.props.location

    let {token, redirect} = query
    if (token) {
      tracker.reset()
      cookiestore.set('graphcool_auth_token', token)
      cookiestore.set('graphcool_customer_id', 'tmp')
      updateNetworkLayer()
      redirect = redirect || ''
      window.location.href = window.location.origin + redirect
    }
  }

  render () {
    return (
      <div>
        <style jsx={true}>{`
          div {
            @p: .pa60, .f20;
          }
        `}</style>
          Redirecting...
      </div>
    )
  }
}
