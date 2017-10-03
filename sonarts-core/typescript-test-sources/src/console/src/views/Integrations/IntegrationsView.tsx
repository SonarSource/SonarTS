import * as React from 'react'
import * as Relay from 'react-relay'
import Helmet from 'react-helmet'
import IntegrationsCardGrid from './IntegrationsCardGrid'
import IntegrationsHeader from './IntegrationsHeader'
import {$p} from 'graphcool-styles'
import * as cx from 'classnames'
import {Viewer} from '../../types/types'

interface Props {
  viewer: Viewer
  location: any
  params: any
}

class IntegrationsView extends React.Component<Props, {}> {
  render() {
    const {viewer: {project, user}, params, location} = this.props

    return (
      <div className={cx($p.overflowScroll, $p.h100, $p.bgBlack04)}>
        <Helmet title='Integrations' />
        <IntegrationsHeader />
        <IntegrationsCardGrid isBeta={user.crm.information.isBeta} project={project} params={params} />
        {this.props.children}
      </div>
    )
  }
}

export default Relay.createContainer(IntegrationsView, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          ${IntegrationsCardGrid.getFragment('project')}
        }
        user {
          crm {
            information {
              isBeta
            }
          }
        }
      }
    `,
  },
})
