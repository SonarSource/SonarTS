import * as React from 'react'
import * as Relay from 'react-relay'
import {withRouter} from 'react-router'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Viewer, Project} from '../../types/types'
import {ShowNotificationCallback} from '../../types/utils'
import {connect} from 'react-redux'
import {showNotification} from '../../actions/notification'
import {bindActionCreators} from 'redux'
import ResetProjectDataMutation from '../../mutations/ResetProjectDataMutation'
import ResetProjectSchemaMutation from '../../mutations/ResetProjectSchemaMutation'
import DeleteProjectMutation from '../../mutations/DeleteProjectMutation'
import UpdateProjectMutation from '../../mutations/UpdateProjectMutation'
import {onFailureShowNotification} from '../../utils/relay'
import {findDOMNode} from 'react-dom'
import {classnames} from '../../utils/classnames'
import PermanentAuthTokenRow from './PermanentAuthTokenRow'
import AddPermanentAuthTokenRow from './AddPermanentAuthTokenRow'
const classes = require('./ProjectSettingsView.scss')

interface Props {
  viewer: Viewer & { project: Project }
  params: any
  showNotification: ShowNotificationCallback
  router: ReactRouter.InjectedRouter
}

interface State {
  projectName: string
  nameChanged: boolean
  idCopied: boolean
}

class ProjectSettingsView extends React.Component<Props, State> {

  refs: {
    [key: string]: any
    projectId: Element,
  }

  constructor(props) {
    super(props)

    this.state = {
      projectName: this.props.viewer.project.name,
      nameChanged: false,
      idCopied: false,
    }
  }

  render() {
    return (
      <div className={classes.root}>
        <div>
          <div className={classes.category}>
            <div className={classes.title}>
              Project Name
            </div>
            <span>
              <input
                className={classes.field}
                type='text'
                placeholder='Name'
                defaultValue={this.props.viewer.project.name}
                onChange={(e) => this.updateProjectName((e.target as HTMLInputElement).value)}
              />
              {this.state.nameChanged &&
              <div
                onClick={this.saveSettings}
                className={classnames(classes.button, classes.green)}
              >
                <span>Save</span>
              </div>
              }
            </span>
          </div>
          <div className={classes.copy} title='Project Id'>
            <div className={classes.copyWrapper}>
              <span className={classes.label}>
                Project Id
              </span>
              <span onClick={this.selectProjectId} className={classes.projectId} ref='projectId'>
                {this.props.viewer.project.id}
              </span>

              <CopyToClipboard
                text={this.props.viewer.project.id}
                onCopy={() => this.setState({idCopied: true} as State)}
              >
                <span className={classes.label}>
                  {this.state.idCopied ? 'Copied' : 'Copy'}
                </span>
              </CopyToClipboard>
            </div>
          </div>
          <div className={classes.category}>
            <div className={classes.title}>
              Permanent Auth Tokens
            </div>
            <div className={classes.tokens}>
              <AddPermanentAuthTokenRow projectId={this.props.viewer.project.id}/>
              {this.props.viewer.project.permanentAuthTokens.edges.map((edge) => edge.node).map((token) => (
                <PermanentAuthTokenRow
                  key={token.id}
                  projectId={this.props.viewer.project.id}
                  permanentAuthToken={token}
                />
              ))}
            </div>
          </div>
          <div className={classes.category}>
            <div
              className={classnames(classes.button, classes.reset)}
              onClick={this.onClickResetProjectData}
            >
              Reset Project Data
            </div>
            <div
              className={classes.button}
              onClick={this.onClickResetCompleteProject}
            >
              Reset Project Data and Models
            </div>
            <div
              className={classnames(classes.button, classes.red)}
              onClick={this.onClickDeleteProject}
            >
              Delete Project
            </div>
          </div>
        </div>
      </div>
    )
  }

  private onClickResetProjectData = (): void => {
    graphcoolConfirm('This will reset the project data.')
      .then(() => {
        Relay.Store.commitUpdate(
          new ResetProjectDataMutation({
            projectId: this.props.viewer.project.id,
          }),
          {
            onSuccess: () => {
              this.props.router.replace(`/${this.props.params.projectName}/playground`)
            },
          })
      })
  }

  private onClickResetCompleteProject = (): void => {
    graphcoolConfirm('This will reset the projects data and schema.')
      .then(() => {
        Relay.Store.commitUpdate(
          new ResetProjectSchemaMutation({
            projectId: this.props.viewer.project.id,
          }),
          {
            onSuccess: () => {
              this.props.router.replace(`/${this.props.params.projectName}/playground`)
            },
          })
      })
  }

  private onClickDeleteProject = (): void => {
    if (this.props.viewer.user.projects.edges.length === 1) {
      this.props.showNotification({
        message: `Sorry. You can't delete your last project. This one is a keeper 😉.`,
        level: 'error',
      })
    }
    graphcoolConfirm('This action will delete this project.')
      .then(() => {
        Relay.Store.commitUpdate(
          new DeleteProjectMutation({
            projectId: this.props.viewer.project.id,
            customerId: this.props.viewer.user.id,
          }),
          {
            onSuccess: () => {
              // TODO replace hard reload
              // was added because deleting the last project caused
              // a relay issue
              window.location.pathname = '/'
            },
          })
      })
  }

  private saveSettings = (): void => {
    Relay.Store.commitUpdate(
      new UpdateProjectMutation(
        {
          project: this.props.viewer.project,
          name: this.state.projectName,
        }),
      {
        onSuccess: () => {
          this.props.router.replace(`/${this.state.projectName}/`)
        },
        onFailure: (transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
        },
      })
  }

  private updateProjectName = (name: string): void => {
    this.setState({
      projectName: name,
      nameChanged: name !== this.props.viewer.project.name,
    } as State)
  }

  private selectProjectId = (): void => {
    const projectId = findDOMNode(this.refs.projectId)
    const range = document.createRange()
    range.setStartBefore(projectId)
    range.setEndAfter(projectId)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
  }

}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({showNotification}, dispatch)
}

const MappedProjectSettingsView = connect(null, mapDispatchToProps)(withRouter(ProjectSettingsView))

export default Relay.createContainer(MappedProjectSettingsView, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          name
          id
          permanentAuthTokens (first: 1000) {
            edges {
              node {
                ${PermanentAuthTokenRow.getFragment('permanentAuthToken')}
                id
                name
                token
              }
            }
          }
        }
        user {
          projects(first: 1000) {
            edges {
              node
            }
          }
        }
      }
    `,
  },
})
