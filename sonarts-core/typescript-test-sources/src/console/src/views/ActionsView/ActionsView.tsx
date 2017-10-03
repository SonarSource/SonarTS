import * as React from 'react'
import * as Relay from 'react-relay'
import {withRouter} from 'react-router'
import {Viewer, Project} from '../../types/types'
import Header from '../../components/Header/Header'
import ScrollBox from '../../components/ScrollBox/ScrollBox'
import ActionRow from './ActionRow'
import ActionBoxes from './ActionBoxes'
import {Icon} from 'graphcool-styles'
import Helmet from 'react-helmet'
const classes: any = require('./ActionsView.scss')
import {$p} from 'graphcool-styles'
import * as cx from 'classnames'
import tracker from '../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'

interface Props {
  viewer: Viewer & { project: Project }
  params: any
  relay: any
  router: ReactRouter.InjectedRouter
  route: any
}

interface State {
  showAddRow: boolean
  editableActionId: string
}

class ActionsView extends React.Component<Props, State> {

  state = {
    showAddRow: false,
    editableActionId: null,
  }

  componentDidMount = () => {
    this.props.router.setRouteLeaveHook(this.props.route, () => {
      if (this.state.showAddRow) {
        // TODO with custom dialogs use "return false" and display custom dialog
        return 'Are you sure you want to discard unsaved changes?'
      }
    })
    tracker.track(ConsoleEvents.MutationCallbacks.viewed())
  }

  render() {
    return (
      <div className={classes.root}>
        <Helmet title='Mutation Callbacks' />
        {!this.state.showAddRow &&
          <Header
              viewer={this.props.viewer}
              params={this.props.params}
              project={this.props.viewer.project}
            >
              <div onClick={() => this.setState({ showAddRow: true } as State)} className={classes.header}>
                <div className={`${classes.button} ${classes.green}`}>
                  <Icon
                    width={16}
                    height={16}
                    src={require('assets/icons/add.svg')}
                  />
                  <span>Create Mutation Callback</span>
                </div>
              </div>

          </Header>
        }
        <div className={classes.content}>
          <ScrollBox>
            {this.state.showAddRow &&
              <ActionBoxes
                project={this.props.viewer.project}
                action={null}
                relay={this.props.relay}
                close={() => this.setState({ showAddRow: false } as State)}
              />
            }
            {this.props.viewer.project.actions.edges.map((edge) => edge.node).map((action) => (
              <div key={action.id}>
                <ActionRow
                  action={action}
                  projectId={this.props.viewer.project.id}
                  onClick={() => this.toggleEdit(action.id)}
                />
                {this.state.editableActionId === action.id &&
                <ActionBoxes
                  project={this.props.viewer.project}
                  action={action}
                  relay={this.props.relay}
                  close={() => this.closeEdit()}
                />
                }
              </div>
            ))}
            {this.props.viewer.project.actions.edges.length === 0 && (
              <div className={cx($p.flex, $p.h100, $p.w100, $p.itemsCenter, $p.justifyCenter)}>
                <div
                  className={cx($p.flex, $p.flexColumn, $p.justifyCenter, $p.mb38, $p.pa25)}
                  style={{maxWidth: 700}}
                >
                  <h2 className={cx($p.fw3, $p.mb16)}>Welcome to the Mutation Callbacks</h2>
                  <div className={cx($p.flex, $p.flexRow)}>
                    <div className={cx($p.flexAuto)}>
                      <div className={cx($p.black50)}>
                        Here you can define a custom http webhook that we call when specific mutations are performed.
                      </div>
                      <div className={$p.black50}>
                        To learn more about mutation callbacks, please have a look in our docs.
                      </div>
                    </div>
                    <div className={$p.ml10}>
                      <a
                        className={cx(
                          $p.pa16,
                          $p.f16,
                          $p.white,
                          $p.br2,
                          $p.bgGreen,
                          $p.pointer,
                          $p.db,
                        )}
                        href='https://graph.cool/docs/reference/platform/mutation-callbacks-ahlohd8ohn'
                        target='_blank'
                      >
                        Docs
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollBox>
        </div>
      </div>
    )
  }

  private toggleEdit = (id: string): void => {
    const currentAction = this.state.editableActionId
    this.closeEdit()
    if (currentAction !== id) {
      this.openEdit(id)
    }
  }

  private openEdit = (id: string): void => {
    this.setState({editableActionId: id} as State)
  }

  private closeEdit = (): void => {
    this.setState({editableActionId: null} as State)
  }

}

export default Relay.createContainer(withRouter(ActionsView), {
  initialVariables: {
    projectName: null, // injected from router
  },
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                project: projectByName(projectName: $projectName) {
                    actions(first: 1000) {
                        edges {
                            node {
                                id
                                ${ActionRow.getFragment('action')}
                                ${ActionBoxes.getFragment('action')}
                            }
                        }
                    }
                    ${ActionBoxes.getFragment('project')}
                    ${Header.getFragment('project')}
                }
                ${Header.getFragment('viewer')}
            }
        `,
    },
})
