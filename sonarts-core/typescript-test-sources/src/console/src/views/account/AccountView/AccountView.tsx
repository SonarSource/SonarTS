import * as React from 'react'
import * as Relay from 'react-relay'
import { Viewer, Project } from '../../../types/types'
import Header from '../../../components/Header/Header'
const classes: any = require('./AccountView.scss')

interface Props {
  viewer: Viewer & { project: Project }
  children: Element
  params: any
}

class AccountView extends React.Component<Props, {}> {

  render () {
    return (
      <div className={classes.root}>
        <Header
          viewer={this.props.viewer}
          params={this.props.params}
          project={this.props.viewer.project}
        >
          <div>Account</div>
        </Header>
        {this.props.children}
      </div>
    )
  }
}

export default Relay.createContainer(AccountView, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          ${Header.getFragment('project')}
        }
        ${Header.getFragment('viewer')}
      }
    `,
  },
})
