import * as React from 'react'
import {Viewer} from '../../../types/types'
import Tokens from './Tokens'
import * as Relay from 'react-relay'

interface Props {
  viewer: Viewer
}

class Authentication extends React.Component<Props, {}> {

  render() {
    return (
      <div className='authentication-container'>
        <style jsx>{`

          .authentication-container {
            @inherit: .br, .ph38;
            max-width: 700px;
            border-color: rgba( 229, 229, 229, 1);

            .headerContent {
              @inherit: .pt60, .pb25, .ph25, .bb, .bBlack10;
            }

            .headerTitle {
              @inherit: .pb6, .mb4, .black30, .f14, .fw6, .ttu;
            }

            .headerDescription {
              @inherit: .pt6, .mt4, .black50, .f16;
            }
          }

        `}</style>
        <div>
          <div className='headerContent'>
            <div className='headerTitle'>Permanent Auth Tokens</div>
            <div className='headerDescription'>
              You can use Permanent Access Tokens to grant access to authenticated
              actions as an alternative way to creating an authenticated user.
            </div>
          </div>
          <Tokens project={this.props.viewer.project} />
        </div>
      </div>
    )
  }
}

export default Relay.createContainer(Authentication, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          ${Tokens.getFragment('project')}
        }
      }
    `,
  },
})
