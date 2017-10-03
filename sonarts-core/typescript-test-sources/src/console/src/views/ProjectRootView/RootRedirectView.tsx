import * as React from 'react'
import {withRouter} from 'react-router'
import * as Relay from 'react-relay'
import * as cookiestore from 'cookiestore'
import {default as mapProps} from 'map-props'
import AddProjectMutation from '../../mutations/AddProjectMutation'
import {Viewer} from '../../types/types'
import tracker from '../../utils/metrics'
const classes: any = require('./RootRedirectView.scss')
import {ConsoleEvents} from 'graphcool-metrics'

interface Props {
  viewer: Viewer,
  projectName: string,
  router: ReactRouter.InjectedRouter
}

class RootRedirectView extends React.Component<Props, {}> {

  constructor(props: Props) {
    super(props)
  }

  componentWillMount(): void {
    if (this.props.projectName) {
      this.props.router.replace(`/${this.props.projectName}`)
    }
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    if (nextProps.projectName) {
      this.props.router.replace(`/${nextProps.projectName}`)
      return false
    }

    return true
  }

  render () {
    if (!this.props.projectName) {
      return (
        <div className={classes.addProject} onClick={this.addProject}>
          Add new project
        </div>
      )
    }

    return (
      <div>Redirecting...</div>
    )
  }

  private addProject = (): void => {
    const projectName = window.prompt('Project name')
    if (projectName) {
      Relay.Store.commitUpdate(
        new AddProjectMutation(
          {
            projectName,
            customerId: this.props.viewer.user.id,
            region: 'US_WEST_2',
          }),
        {
          onSuccess: () => {
            tracker.track(ConsoleEvents.Project.created({name: projectName}))
            this.props.router.replace(`/${projectName}`)
          },
        })
    }
  }
}

const MappedRootRedirectView = mapProps({
  viewer: (props) => props.viewer,
  projectName: (props) => {
    if (!props.viewer.user || props.viewer.user.projects.edges.length === 0) {
      return null
    }

    const projects = props.viewer.user.projects.edges.map((edge) => edge.node)
    let project

    if (cookiestore.has('graphcool_last_used_project_id')) {
      project = projects.find((p) => p.id === cookiestore.get('graphcool_last_used_project_id'))
    }

    if (!project) {
      project = projects[0]
    }

    return project.name
  },
})(withRouter(RootRedirectView))

export default Relay.createContainer(MappedRootRedirectView, {
  fragments: {
    // NOTE name needed because of relay bug
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
        user {
          id
          projects(first: 100) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `,
  },
})
