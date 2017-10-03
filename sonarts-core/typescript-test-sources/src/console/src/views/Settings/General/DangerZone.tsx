import * as React from 'react'
import * as Relay from 'react-relay'
import {withRouter} from 'react-router'
import ResetProjectDataMutation from '../../../mutations/ResetProjectDataMutation'
import ResetProjectSchemaMutation from '../../../mutations/ResetProjectSchemaMutation'
import DeleteProjectMutation from '../../../mutations/DeleteProjectMutation'
import {Viewer, Project} from '../../../types/types'
import {showNotification} from '../../../actions/notification'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {ShowNotificationCallback} from '../../../types/utils'
import {onFailureShowNotification} from '../../../utils/relay'

interface Props {
  viewer: Viewer
  showNotification: ShowNotificationCallback
  project: Project
  router: ReactRouter.InjectedRouter
}

interface State {
  hoveredRowIndex: number
}

class DangerZone extends React.Component<Props, State> {

  state = {
    hoveredRowIndex: -1,
  }

  render() {
    return (
      <div className='container'>
        <style jsx={true}>{`
          .container {
            @inherit: .mt38, .bt, .pt38, .ph60, .bgBlack04;
            border-color: rgba(208,2,27,1);
          }

          .actionRow {
            @inherit: .flex, .justifyBetween, .itemsCenter, .pv25, .ph16;
          }

          .bottomBorderForActionRow {
            @inherit: .bb;
            border-color: rgba( 229, 229, 229, 1);
          }

          .solidOrange {
            color: rgba(241,143,1,1);
          }

          .orangeActionButton {
            color: rgba(241,143,1,1);
            background-color: rgba(241,143,1,.2);
          }

          .deleteRed100 {
            color: rgba(242,92,84,1);
          }

          .deleteBgrRed20 {
            background-color: rgba(242,92,84,.2);
          }

          .redActionButton {
            color: rgba(242,92,84,1);
            background-color: rgba(242,92,84,.2);
          }

          .actionButton {
            @inherit: .pv10, .ph16, .f16, .nowrap, .br2, .pointer;
          }

          .dangerZoneTitle {
            @inherit: .ttu, .f14, .fw6, .pl16, .pt25, .pb10;
            color: rgba(242,92,84,1);
          }

          .hoveredOrangeActionButton {
            @inherit: .white;
            background-color: rgba(241,143,1,1);
          }

          .hoveredRedActionButton {
            @inherit: .white;
            background-color: rgba(242,92,84,1);
          }

        `}</style>
        <div className='dangerZoneTitle'>Danger Zone</div>
        <div
          className='actionRow bottomBorderForActionRow'
        >
          <div>
            <div
              className={`fw3 f25 ${this.state.hoveredRowIndex === 0 ? 'solidOrange' : 'black50'}`}
            >
              Reset Project Data
            </div>
            <div
              className={`f16 ${this.state.hoveredRowIndex === 0 ? 'solidOrange' : 'black50'}`}
            >
              Delete all Nodes, but keep Models and Fields.
            </div>
          </div>
          <div
            className={`actionButton ${this.state.hoveredRowIndex === 0 ?
              'hoveredOrangeActionButton' : 'orangeActionButton'}`}
            onClick={this.onClickResetProjectData}
            onMouseEnter={() => this.setState({hoveredRowIndex: 0} as State)}
            onMouseLeave={() => this.setState({hoveredRowIndex: -1} as State)}
          >
            Reset Data
          </div>
        </div>
        <div className='actionRow bottomBorderForActionRow'>
          <div>
            <div
              className={`fw3 f25 ${this.state.hoveredRowIndex === 1 ? 'solidOrange' : 'black50'}`}
            >
              Reset Project Data & Models
            </div>
            <div
              className={`f16 ${this.state.hoveredRowIndex === 1 ? 'solidOrange' : 'black50'}`}
            >
              Delete everything inside the project.
            </div>
          </div>
          <div
            className={`actionButton ${this.state.hoveredRowIndex === 1 ?
              'hoveredOrangeActionButton' : 'orangeActionButton'}`}
            onClick={this.onClickResetCompleteProject}
            onMouseEnter={() => this.setState({hoveredRowIndex: 1} as State)}
            onMouseLeave={() => this.setState({hoveredRowIndex: -1} as State)}
          >
            Reset Everything
          </div>
        </div>
        <div
          className='actionRow'
        >
          <div>
            <div
              className='fw3 f25 deleteRed100'
            >
              Delete this Project</div>
            <div
              className='f16 deleteRed100'
            >
              That's the point of no return.</div>
            </div>
            <div
              className={`actionButton ${this.state.hoveredRowIndex === 2 ?
                'hoveredRedActionButton' : 'redActionButton'}`}
              onClick={this.onClickDeleteProject}
              onMouseEnter={() => this.setState({hoveredRowIndex: 2} as State)}
              onMouseLeave={() => this.setState({hoveredRowIndex: -1} as State)}
            >
              Delete Project</div>
          </div>
        </div>
    )
}

  private onClickResetProjectData = (): void => {
    graphcoolConfirm('You are reseting the project data.')
      .then(() => {
        Relay.Store.commitUpdate(
          new ResetProjectDataMutation({
            projectId: this.props.project.id,
          }),
          {
            onSuccess: () => {
              this.props.showNotification({message: 'All nodes were deleted', level: 'success'})
              this.props.router.replace(`/${this.props.project.name}/settings/general`)
            },
            onFailure: (transaction) => {
              onFailureShowNotification(transaction, this.props.showNotification)
            },
          })
      })
  }

  private onClickResetCompleteProject = (): void => {
    graphcoolConfirm('Your are resetting the projects schema and data.')
      .then(() => {
        Relay.Store.commitUpdate(
          new ResetProjectSchemaMutation({
            projectId: this.props.project.id,
          }),
          {
            onSuccess: () => {
              this.props.showNotification({message: 'All nodes and models were deleted', level: 'success'})
              this.props.router.replace(`/${this.props.project.name}/settings/general`)
            },
            onFailure: (transaction) => {
              onFailureShowNotification(transaction, this.props.showNotification)
            },
          })
      })
  }

  private onClickDeleteProject = (): void => {
    if (this.props.viewer.user.projects.edges.length === 1) {
      this.props.showNotification({
        message: `Sorry. You can't delete your last project. This one is a keeper.`,
        level: 'error',
      })
    }
    graphcoolConfirm('You are deleting this project. All data and the schema will be lost.')
      .then(() => {
        Relay.Store.commitUpdate(
          new DeleteProjectMutation({
            projectId: this.props.project.id,
            customerId: this.props.viewer.user.id,
          }),
          {
            onSuccess: () => {
              this.props.router.replace(`/`)
              this.props.showNotification({message: 'Your project was deleted', level: 'success'})
            },

          })
      })
  }

}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({showNotification}, dispatch)
}

const MappedDangerZone = connect(null, mapDispatchToProps)(withRouter(DangerZone))

export default Relay.createContainer(MappedDangerZone, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        user {
          id
          projects(first: 10) {
            edges
          }
        }
      }
    `,
    project: () => Relay.QL`
      fragment on Project {
        id
        name
      }
    `,
  },
})
