import * as React from 'react'
import * as Relay from 'react-relay'
import Helmet from 'react-helmet'
import mapProps from '../../components/MapProps/MapProps'
import {Project} from '../../types/types'
import PermissionsList from './PermissionsList/PermissionsList'
import PermissionsHeader from './PermissionsHeader/PermissionsHeader'
import AllRelationPermissionsList from './RelationPermissionsList/AllRelationPermissionsList'
import {$p} from 'graphcool-styles'
import * as cx from 'classnames'
import tracker from '../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'

interface Props {
  params: any
  project: Project
  children: JSX.Element
  location: any
}

class PermissionsView extends React.Component<Props, null> {
  componentDidMount() {
    tracker.track(ConsoleEvents.Permissions.viewed())
  }
  render() {
    const {project, params, location} = this.props
    return (
      <div
        className={cx(
          $p.flex,
          $p.flexColumn,
          $p.bgBlack04,
        )}
      >
        <Helmet title='Permissions'/>
        <PermissionsHeader params={params} location={location} />
        {this.props.children && (
          React.cloneElement(this.props.children, {params, project})
        )}
      </div>
    )
  }
}
// {activeTab === 0 && (
//   <PermissionsList params={params} project={project} />
// )}
// {activeTab === 1 && (
//   <AllRelationPermissionsList params={params} project={project} />
// )}

const MappedPermissionsView = mapProps({
  project: props => props.viewer.project,
})(PermissionsView)

export default Relay.createContainer(MappedPermissionsView, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          ${PermissionsList.getFragment('project')}
          ${AllRelationPermissionsList.getFragment('project')}
        }
      }
    `,
  },
})
