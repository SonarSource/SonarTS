import * as React from 'react'
import {Viewer} from '../../../types/types'
import ProjectInfo from './ProjectInfo'
import * as Relay from 'react-relay'
import DangerZone from './DangerZone'

interface Props {
  viewer: Viewer
}

class General extends React.Component<Props, {}> {

  render() {
    return (
      <div className='container'>
        <style jsx={true}>{`
          .container {
            @inherit: .br;
            max-width: 700px;
            border-color: rgba( 229, 229, 229, 1);
          }
        `}</style>
        <ProjectInfo
          project={this.props.viewer.project}
        />
        <DangerZone
          viewer={this.props.viewer}
          project={this.props.viewer.project}
        />
      </div>
    )
  }
}

export default Relay.createContainer(General, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${DangerZone.getFragment('viewer')},
        project: projectByName(projectName: $projectName) {
          ${DangerZone.getFragment('project')},
          ${ProjectInfo.getFragment('project')}  
          name
        }
      }
    `,
  },
})
