import * as React from 'react'
import Helmet from 'react-helmet'
import ReactElement = React.ReactElement
import * as Relay from 'react-relay'
import { $p } from 'graphcool-styles'
import * as cx from 'classnames'
import {Viewer, SearchProviderAlgolia, AlgoliaSyncQuery, Project} from '../../../types/types'
import {withRouter} from 'react-router'
import AlgoliaPopupHeader from '../AlgoliaPopup/AlgoliaPopupHeader'
import AlgoliaPopupIndexes from '../AlgoliaPopup/AlgoliaPopupIndexes'
import AlgoliaPopupFooter from '../AlgoliaPopup/AlgoliaPopupFooter'
import mapProps from '../../../components/MapProps/MapProps'
import UpdateSearchProviderAlgolia from '../../../mutations/UpdateSearchProviderAlgolia'
import {connect} from 'react-redux'
import {showNotification} from '../../../actions/notification'
import {onFailureShowNotification} from '../../../utils/relay'
import {ShowNotificationCallback} from '../../../types/utils'
import AlgoliaHeader from './AlgoliaHeader'
import AlgoliaIndexes from './AlgoliaIndexes'
import AlgoliaQueryEditor from './AlgoliaQueryEditor'
import CreateAlgoliaIndex from './CreateAlgoliaIndex'
import DeleteAlgoliaSyncQueryMutation from '../../../mutations/DeleteAlgoliaSyncQueryMutation'
import UpdateAlgoliaSyncQueryMutation from '../../../mutations/UpdateAlgoliaSyncQueryMutation'
import AlgoliaModal from './AlgoliaModal'

interface Props {
  viewer: Viewer
  params: any
  router: ReactRouter.InjectedRouter
  algolia: SearchProviderAlgolia
  projectId: string
  showNotification: ShowNotificationCallback
  relay: any
  indexes: AlgoliaSyncQuery[]
  project: Project
}

interface State {
  valid: boolean
  apiKey: string
  applicationId: string
  isEnabled: boolean
  selectedIndexIndex: number
  currentFragment: string
  fragmentValid: boolean
  editing: boolean
  showNewIndex: boolean
  showModal: boolean
}

class AlgoliaView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const {algolia: {apiKey, applicationId, isEnabled}, indexes} = props

    this.state = {
      valid: false,
      apiKey,
      applicationId,
      isEnabled,
      selectedIndexIndex: 0,
      currentFragment: indexes[0] && indexes[0].fragment || '',
      editing: indexes.length > 0,
      showNewIndex: false,
      fragmentValid: true,
      showModal: applicationId.length === 0 && apiKey.length === 0,
    }
    global['a'] = this
  }
  render() {
    const {algolia, params, children, project} = this.props
    const {selectedIndexIndex, showNewIndex, fragmentValid, applicationId, apiKey, showModal} = this.state
    const indexes = algolia.algoliaSyncQueries.edges.map(edge => edge.node)

    return (
      <div className='algolia-view'>
        <Helmet title='Algolia Integration' />
        <style jsx>{`
          .algolia-view {
            @p: .flex;
          }
          .col {
            @p: .flex1;
          }
          .button {
            @p: .pointer, .dib, .mt38;
            padding: 9px 16px 10px 16px;
          }
          .green {
            @p: .bgGreen, .white, .br2;
          }
          .intro {
            @p: .flex, .justifyCenter, .w100, .h100, .pa38, .itemsStart;
            h1, h2 {
              @p: .tc;
            }
            h1 {
              @p: .f25, .fw3;
            }
            h2 {
              @p: .black40, .f14, .mt25, .fw4;
            }
          }
          .inner-intro {
            @p: .flex, .justifyCenter, .itemsCenter, .flexColumn, .mt16;
          }
        `}</style>
        <div className='col'>
          <AlgoliaHeader
            onAddIndex={this.handleShowNewIndex}
            onOpenModal={this.handleOpenModal}
            params={this.props.params}
          />
          {indexes.length > 0 ? (
            <AlgoliaIndexes
              indexes={indexes}
              params={params}
              onSelectIndex={this.handleIndexSelection}
              selectedIndexIndex={selectedIndexIndex}
            />
          ) : (
            <div className='intro'>
            </div>
          )}
        </div>
        <div className='col'>
          {(indexes.length > 0 && !showNewIndex) ? (
            <AlgoliaQueryEditor
              algolia={algolia}
              onFragmentChange={this.handleFragmentChange}
              fragmentChanged={this.state.currentFragment !== indexes[selectedIndexIndex].fragment}
              fragment={this.state.currentFragment}
              selectedModel={indexes[selectedIndexIndex] && indexes[selectedIndexIndex].model}
              onCancel={this.handleUpdateCancel}
              onUpdate={this.updateIndex}
              onDelete={this.delete}
              fragmentValid={fragmentValid}
            />
          ) : (
            <CreateAlgoliaIndex
              algolia={algolia}
              project={project}
              onRequestClose={this.handleCloseNewIndex}
            />
          )}
        </div>
        {showModal && (
          <AlgoliaModal
            apiKey={apiKey}
            applicationId={applicationId}
            onChangeApiKey={this.handleChangeApiKey}
            onChangeApplicationId={this.handleApplicationId}
            onRequestClose={this.handleCloseModal}
            onSave={this.update}
          />
        )}
      </div>
    )
  }

  private handleOpenModal = () => {
    this.setState({
      showModal: true,
    } as State)
  }

  private handleCloseModal = () => {
    if (this.state.applicationId === '' && this.state.apiKey === '') {
      return this.close()
    }
    this.setState({
      showModal: false,
    } as State)
  }

  private handleChangeApiKey = (e: any) => {
    this.setState({
      apiKey: e.target.value,
    } as State)
  }

  private handleApplicationId = (e: any) => {
    this.setState({
      applicationId: e.target.value,
    } as State)
  }

  private handleUpdateCancel = () => {
    const {indexes} = this.props
    const {selectedIndexIndex} = this.state
    const node = indexes[selectedIndexIndex]

    this.setState({
      currentFragment: node.fragment,
    } as State)
  }

  private handleCloseNewIndex = () => {
    this.setState({
      showNewIndex: false,
    } as State)
    this.props.relay.forceFetch()
  }

  private handleShowNewIndex = () => {
    this.setState({
      showNewIndex: true,
    } as State)
  }

  private handleFragmentChange = (fragment: string, fragmentValid: boolean) => {
    this.setState({
      currentFragment: fragment,
      fragmentValid,
    } as State)
  }

  private handleIndexSelection = (i: number) => {
    const {indexes} = this.props
    this.setState({
      selectedIndexIndex: i,
      currentFragment: indexes[i].fragment,
    } as State)
  }

  private updateValid() {
    const {apiKey, applicationId} = this.state
    const valid = apiKey.length > 0 && applicationId.length > 0
    this.setState({valid} as State)
  }

  private close = () => {
    const {router, params: {projectName}} = this.props
    router.push(`/${projectName}/integrations`)
  }

  private updateIndex = () => {
    const {indexes} = this.props
    const {currentFragment, selectedIndexIndex} = this.state
    const node = indexes[selectedIndexIndex]

    if (!this.indexValid()) {
      showNotification({
        message: 'The search query is not valid',
        level: 'error',
      })
      return
    }

    if (this.indexValid() && node) {
      Relay.Store.commitUpdate(
        new UpdateAlgoliaSyncQueryMutation({
          algoliaSyncQueryId: node.id,
          fragment: currentFragment,
          isEnabled: true,
          indexName: node.indexName,
        }),
      )
    }
  }

  private indexValid() {
    return this.state.fragmentValid
  }

  private update = () => {
    const {valid, apiKey, applicationId, isEnabled} = this.state
    const {algolia, projectId} = this.props
    Relay.Store.commitUpdate(
      new UpdateSearchProviderAlgolia({
        searchProviderAlgoliaId: algolia.id,
        isEnabled: true,
        apiKey,
        applicationId,
        projectId,
      }),
      {
        onSuccess: (transaction) => {
          this.handleCloseModal()
        },
        onFailure: (transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
        },
      },
    )
  }

  private delete = () => {
    const {algolia, indexes} = this.props
    const {selectedIndexIndex} = this.state

    const node = indexes[selectedIndexIndex]

    if (node) {
      Relay.Store.commitUpdate(
        new DeleteAlgoliaSyncQueryMutation({
          algoliaSyncQueryId: node.id,
          searchProviderAlgoliaId: algolia.id,
        }),
      )
    }

    if (selectedIndexIndex > 0) {
      this.setState({
        selectedIndexIndex: selectedIndexIndex - 1,
      } as State)
    }
  }
}

const ReduxContainer = connect(null, {
  showNotification,
})(AlgoliaView)

const MappedAlgoliaPopup = mapProps({
  projectId: props => props.viewer.project.id,
  project: props => props.viewer.project,
  algolia: props => {
    const algolias = props.viewer.project.integrations.edges.filter(edge => edge.node.type === 'SEARCH_PROVIDER')
    if (algolias.length > 0) {
      return algolias[0].node
    }

    return null
  },
  indexes: props => {
    let algolia: any
    const algolias = props.viewer.project.integrations.edges.filter(edge => edge.node.type === 'SEARCH_PROVIDER')
    if (algolias.length > 0) {
      algolia = algolias[0].node
      return algolia.algoliaSyncQueries.edges.map(edge => edge.node)
    } else {
      return []
    }
  },
})(ReduxContainer)

export default Relay.createContainer(withRouter(MappedAlgoliaPopup), {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          id
          ${CreateAlgoliaIndex.getFragment('project')}
          integrations(first: 100) {
            edges {
              node {
                id
                name
                type
                ... on SearchProviderAlgolia {
                  ${CreateAlgoliaIndex.getFragment('algolia')}
                  ${AlgoliaQueryEditor.getFragment('algolia')}
                  id
                  isEnabled
                  apiKey
                  applicationId
                  algoliaSyncQueries(first: 100) {
                    edges {
                      node {
                        id
                        fragment
                        indexName
                        isEnabled
                        model {
                          itemCount
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
})
