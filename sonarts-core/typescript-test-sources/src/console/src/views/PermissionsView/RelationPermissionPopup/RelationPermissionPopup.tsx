import * as React from 'react'
import * as Relay from 'react-relay'
import {buildClientSchema} from 'graphql'
import { $p } from 'graphcool-styles'
import * as cx from 'classnames'
import {
  Project, Operation, UserType, Model, ModelPermission, PermissionRuleType,
  RelationPermission, Relation,
} from '../../../types/types'
import mapProps from '../../../components/MapProps/MapProps'
import PopupWrapper from '../../../components/PopupWrapper/PopupWrapper'
import { withRouter } from 'react-router'
import tracker from '../../../utils/metrics'
import { ConsoleEvents, MutationType } from 'graphcool-metrics'
import {connect} from 'react-redux'
import * as Modal from 'react-modal'
import {fieldModalStyle} from '../../../utils/modalStyle'
import Loading from '../../../components/Loading/Loading'
import {extractSelection, addVarsAndName} from '../PermissionPopup/ast'
import {showNotification} from '../../../actions/notification'
import {onFailureShowNotification} from '../../../utils/relay'
import {ShowNotificationCallback} from '../../../types/utils'
import RelationBaseSettings from './RelationBaseSettings'
import PermissionConditions from '../PermissionPopup/PermissionConditions'
import {isValid, didChange} from './RelationPermissionPopupState'
import RelationPermissionPopupHeader from './RelationPermissionPopupHeader'
import PermissionPopupFooter from '../PermissionPopup/PermissionPopupFooter'
import UpdateRelationPermissionMutation from '../../../mutations/RelationPermission/UpdateRelationPermission'
import DeleteRelationPermissionMutation from '../../../mutations/RelationPermission/DeleteRelationPermission'
import AddRelationPermissionMutation from '../../../mutations/RelationPermission/AddRelationPermission'
import ModalDocs from '../../../components/ModalDocs/ModalDocs'

interface Props {
  params: any
  project: Project
  children: JSX.Element
  router: ReactRouter.InjectedRouter
  relation?: Relation
  permission?: RelationPermission
  isBetaCustomer: boolean
  showNotification: ShowNotificationCallback
}

export interface RelationPermissionPopupState {
  connect: boolean
  disconnect: boolean
  userType: UserType
  rule: PermissionRuleType
  ruleName: string
  ruleGraphQuery: string
  queryValid: boolean
  tabs: string[]
  showErrors: boolean
  selectedTabIndex: number
  editing: boolean
  loading: boolean
  queryChanged: boolean
}

const modalStyling = {
  ...fieldModalStyle,
  content: {
    ...fieldModalStyle.content,
    overflow: 'visible',
    width: 750,
  },
}

class PermissionPopup extends React.Component<Props, RelationPermissionPopupState> {
  private mutationType: MutationType

  constructor(props) {
    super(props)

    this.mutationType = props.permission ? 'Update' : 'Create'

    const schema = buildClientSchema(JSON.parse(this.props.relation.permissionSchema))
    if (props.permission) {
      const {userType, rule, ruleGraphQuery, connect, disconnect, ruleName} = props.permission
      this.state = {
        connect,
        disconnect,
        userType,
        rule,
        ruleName,
        ruleGraphQuery: (!ruleGraphQuery || ruleGraphQuery === '') ?
          getEmptyRelationPermissionQuery(props.relation) :
          addVarsAndName(props.relation.name, ruleGraphQuery, props.relation.permissionQueryArguments, schema),
        queryValid: true,
        tabs: ['Select Operations', 'Define Rules'],
        selectedTabIndex: 0,
        showErrors: false,
        editing: true,
        loading: false,
        queryChanged: false,
      }
      return
    }

    this.state = {
      userType: 'EVERYONE' as UserType,
      rule: 'NONE' as PermissionRuleType,
      ruleGraphQuery: getEmptyRelationPermissionQuery(props.relation),
      ruleName: '',
      queryValid: true,
      tabs: ['Select Operations', 'Define Rules'],
      selectedTabIndex: 0,
      showErrors: false,
      editing: false,
      loading: false,
      queryChanged: false,
      connect: true,
      disconnect: true,
    }
    global['p'] = this
  }

  componentDidMount() {
    tracker.track(ConsoleEvents.Permissions.Popup.opened({type: this.mutationType}))
  }

  render() {
    const {params, relation} = this.props
    const {
      userType,
      connect,
      disconnect,
      rule,
      ruleGraphQuery,
      selectedTabIndex,
      showErrors,
      tabs,
      editing,
    } = this.state

    const errors = isValid(this.state)
    const valid = !Object.keys(errors).reduce((acc, curr) => acc || errors[curr], false)
    const changed = didChange(this.state, this.props.permission)

    return (
      <Modal
        onRequestClose={(e) => {
          if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
            return
          }
          this.closePopup()
          tracker.track(ConsoleEvents.Permissions.Popup.canceled({type: this.mutationType}))
        }}
        isOpen={true}
        style={modalStyling}
        contentLabel='Relation Permission Popup'
      >
        <style jsx>{`
          .permission-popup {
            @p: .flexColumn, .overflowVisible, .bgWhite, .relative;
          }
          .popup-body {
            max-height: calc(100vh - 200px);
          }
          .no-delete {
            @p: .pa38, .brown;
          }
          .loading {
            @p: .absolute, .top0, .bottom0, .flex, .itemsCenter, .justifyCenter, .bgWhite80, .z999;
            left: -20px;
            right: -20px;
            box-shadow: 0 0 10px rgba(255,255,255,.8);
          }
        `}</style>
        <ModalDocs
          title='How do permissions work?'
          id='type-relation-permission-popup'
          resources={[
            {
              title: 'Overview over Permissions',
              type: 'guide',
              link: 'https://www.graph.cool/docs/reference/platform/authorization/overview-iegoo0heez/',
            },
            {
              title: 'How to define Permission Queries',
              type: 'guide',
              link: 'https://www.graph.cool/docs/reference/platform/authorization/permission-queries-iox3aqu0ee/',
            },
            {
              title: 'Design Patterns',
              type: 'article',
              link: 'https://www.graph.cool/docs/tutorials/authorization-content-management-system-miesho4goo/',
            },
          ]}
          videoId='l1KEssmlhPA'
        >
          <div
            className='permission-popup'
          >
            <RelationPermissionPopupHeader
              errors={errors}
              tabs={tabs}
              relationName={params.relationName}
              activeTabIndex={selectedTabIndex}
              onRequestClose={this.closePopup}
              onSelectTab={this.handleSelectTab}
              showErrors={showErrors}
              editing={editing}
            />
            <div className='popup-body'>
              {(selectedTabIndex === 0) && (
                <RelationBaseSettings
                  relation={relation}
                  connect={connect}
                  disconnect={disconnect}
                  toggleConnect={this.toggleConnect}
                  toggleDisconnect={this.toggleDisconnect}
                />
              )}
              {(selectedTabIndex === 1) && (
                <PermissionConditions
                  userType={userType}
                  rule={rule}
                  permissionSchema={relation.permissionSchema}
                  permissionQueryArguments={relation.permissionQueryArguments}
                  ruleGraphQuery={ruleGraphQuery}
                  setUserType={this.setUserType}
                  setRuleGraphQuery={this.setRuleGraphQuery}
                  queryValid={!errors.invalidQuery}
                  showErrors={showErrors}
                  onQueryValidityChange={this.handleQueryValidityChange}
                  ruleName={this.state.ruleName}
                  onRuleNameChange={this.handleRuleNameChange}
                  relation={this.props.relation}
                  connect={connect}
                  disconnect={disconnect}
                  toggleUserType={this.handleToggleUserType}
                  toggleRuleType={this.handleToggleRuleType}
                />
              )}
            </div>
            <PermissionPopupFooter
              valid={valid}
              onCancel={this.closePopup}
              onDelete={this.deletePermission}
              onSubmit={this.handleSubmit}
              create={!editing}
              onSelectIndex={this.handleSelectTab}
              activeTabIndex={this.state.selectedTabIndex}
              changed={changed}
              tabs={tabs}
            />
            {this.state.loading && (
              <div className='loading'>
                <Loading />
              </div>
            )}
          </div>
        </ModalDocs>
      </Modal>
    )
  }

  private handleToggleUserType = () => {
    this.setState(state => {
      const oldUserType = state.userType
      return {
        ...state,
        userType: oldUserType === 'EVERYONE' ? 'AUTHENTICATED' : 'EVERYONE',
      }
    })
  }

  private handleToggleRuleType = () => {
    this.setState(state => {
      const oldRule = state.rule
      return {
        ...state,
        rule: oldRule === 'GRAPH' ? 'NONE' : 'GRAPH',
      }
    })
  }

  private handleRuleNameChange = e => {
    this.setState({
      ruleName: e.target.value,
    } as RelationPermissionPopupState)
  }

  private toggleConnect = () => {
    this.setState(state => {
      return {
        ...state,
        connect: !state.connect,
      }
    })
  }

  private toggleDisconnect = () => {
    this.setState(state => {
      return {
        ...state,
        disconnect: !state.disconnect,
      }
    })
  }

  private handleQueryValidityChange = (valid: boolean) => {
    this.setState({queryValid: valid} as RelationPermissionPopupState)
  }

  private handleSubmit = () => {
    const errors = isValid(this.state)
    const valid = !Object.keys(errors).reduce((acc, curr) => acc || errors[curr], false)

    if (!valid) {
      return this.setState({
        showErrors: true,
      } as RelationPermissionPopupState)
    }

    if (this.state.editing) {
      this.updatePermission()
    } else {
      this.createPermission()
    }
  }

  private handleSelectTab = (index: number) => {
    this.setState({selectedTabIndex: index} as RelationPermissionPopupState)
  }

  private setRule = (rule: PermissionRuleType) => {
    this.setState({rule} as RelationPermissionPopupState)
  }

  private setRuleGraphQuery = (ruleGraphQuery: string) => {
    this.setState({ruleGraphQuery, queryChanged: true} as RelationPermissionPopupState)
  }

  private setUserType = (userType: UserType) => {
    this.setState({userType} as RelationPermissionPopupState)
  }

  private updatePermission = () => {
    const {permission: {isActive, id}} = this.props
    const {userType, rule, ruleGraphQuery, connect, disconnect, ruleName} = this.state

    const updatedNode = {
      id,
      userType,
      rule,
      ruleGraphQuery: extractSelection(ruleGraphQuery),
      ruleName,
      isActive,
      connect,
      disconnect,
    }
    tracker.track(ConsoleEvents.Permissions.Popup.submitted({type: this.mutationType}))

    this.setState({loading: true} as RelationPermissionPopupState, () => {
      Relay.Store.commitUpdate(
        new UpdateRelationPermissionMutation(updatedNode),
        {
          onSuccess: () => this.closePopup(),
          onFailure: (transaction) => {
            onFailureShowNotification(transaction, this.props.showNotification)
            this.setState({loading: false} as RelationPermissionPopupState)
          },
        },
      )
    })
  }

  private createPermission = () => {
    const {relation} = this.props
    const {userType, connect, disconnect, rule, ruleName, ruleGraphQuery} = this.state

    tracker.track(ConsoleEvents.Permissions.Popup.submitted({type: this.mutationType}))
    this.setState({loading: true} as RelationPermissionPopupState, () => {
      Relay.Store.commitUpdate(
        new AddRelationPermissionMutation({
          relationId: relation.id,
          connect,
          disconnect,
          userType,
          rule,
          ruleName,
          ruleGraphQuery,
        }),
        {
          onSuccess: () => this.closePopup(),
          onFailure: (transaction) => {
            onFailureShowNotification(transaction, this.props.showNotification)
            this.setState({loading: false} as RelationPermissionPopupState)
          },
        },
      )
    })
  }

  private deletePermission = () => {
    const {permission: {id}, relation} = this.props

    tracker.track(ConsoleEvents.Permissions.Popup.submitted({type: this.mutationType}))
    this.setState({loading: true} as RelationPermissionPopupState, () => {
      Relay.Store.commitUpdate(
        new DeleteRelationPermissionMutation({
          relationPermissionId: id,
          relationId: relation.id,
        }),
        {
          onSuccess: () => this.closePopup(),
          onFailure: (transaction) => {
            onFailureShowNotification(transaction, this.props.showNotification)
            this.setState({loading: false} as RelationPermissionPopupState)
          },
        },
      )
    })
  }

  private closePopup = () => {
    const {router, params} = this.props
    router.push(`/${params.projectName}/permissions/relations`)
  }
}

const ReduxContainer = connect(null, {showNotification})(PermissionPopup)

const MappedPermissionPopup = mapProps({
  permission: props => props.node || null,
  relation: props => (props.viewer && props.viewer.relation) || (props.node && props.node.relation),
  isBetaCustomer: props => (props.viewer && props.viewer.user.crm.information.isBeta) || false,
})(ReduxContainer)

export const EditRelationPermissionPopup = Relay.createContainer(withRouter(MappedPermissionPopup), {
  fragments: {
    node: () => Relay.QL`
      fragment on Node {
        id
        ... on RelationPermission {
          connect
          disconnect
          isActive
          rule
          ruleGraphQuery
          ruleName
          userType
          relation {
            name
            permissionSchema
            permissionQueryArguments {
              group
              name
              typeName
            }
            leftModel {
              name
            }
            rightModel {
              name
            }
          }
        }
      }
    `,
    viewer: () => Relay.QL`
      fragment on Viewer {
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

export const AddRelationPermissionPopup = Relay.createContainer(withRouter(MappedPermissionPopup), {
  initialVariables: {
    projectName: null, // injected from router
    relationName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        user {
          crm {
            information {
              isBeta
            }
          }
        }
        relation: relationByName(projectName: $projectName, relationName: $relationName) {
          id
          name
          permissionSchema
          permissionQueryArguments {
            group
            name
            typeName
          }
          leftModel {
            name
          }
          rightModel {
            name
          }
        }
      }
    `,
  },
})

function getEmptyRelationPermissionQuery(relation: Relation) {
  return `query {
  Some${relation.leftModel.name}Exists(filter: {
    # ...
  })
  Some${relation.rightModel.name}Exists(filter: {
    # ...
  })
}`
}
