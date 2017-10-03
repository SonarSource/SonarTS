import * as React from 'react'
import Auth0LockWrapper from '../../../components/Auth0LockWrapper/Auth0LockWrapper'
import { withRouter } from 'react-router'

interface Props {
  updateAuth: (cliToken: string) => Promise<void>
  redirectUrl: string
  cliToken: string
  loading: boolean
  router: any
}

class Right extends React.Component<Props, {}> {

  render() {
    const successCallback = async () => {
      await this.props.updateAuth(this.props.cliToken)

      if (this.props.redirectUrl.startsWith('http')) {
        window.location.href = this.props.redirectUrl
      } else {
        this.props.router.push(this.props.redirectUrl)
      }
    }

    return (
      <div
        className={`authenticate-right ml60`}
      >
        <style jsx={true}>{`
        .authenticate-right :global(.auth0-lock-header) {
          @p: .dn;
        }
      `}</style>
        <div style={{display: this.props.loading ? 'none' : undefined}}>
          <Auth0LockWrapper
            renderInElement
            successCallback={successCallback}
            initialScreen='signUp'
          />
        </div>
      </div>
    )
  }

}

export default withRouter(Right)
