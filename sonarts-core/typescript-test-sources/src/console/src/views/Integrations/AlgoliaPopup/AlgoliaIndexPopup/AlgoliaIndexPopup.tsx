import * as React from 'react'
import * as Relay from 'react-relay'
import { $p } from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'
import {Project, Model, SearchProviderAlgolia, AlgoliaSyncQuery} from '../../../../types/types'
import {withRouter} from 'react-router'
import mapProps from '../../../../components/MapProps/MapProps'
import PopupWrapper from '../../../../components/PopupWrapper/PopupWrapper'
import AlgoliaIndexPopupHeader from './AlgoliaIndexPopupHeader'
import AlgoliaIndexPopupModels from './AlgoliaIndexPopupModels'
import AlgoliaIndexPopupQuery from './AlgoliaIndexPopupQuery'
import AddAlgoliaSyncQueryMutation from '../../../../mutations/AddAlgoliaSyncQueryMutation'
import UpdateAlgoliaSyncQueryMutation from '../../../../mutations/UpdateAlgoliaSyncQueryMutation'
import DeleteAlgoliaSyncQueryMutation from '../../../../mutations/DeleteAlgoliaSyncQueryMutation'

interface Props {
  project: Project
  params: any
  router: ReactRouter.InjectedRouter
  algolia: SearchProviderAlgolia
  node: AlgoliaSyncQuery
}

interface State {
  title: string
  selectedModel: Model
  fragment: string
  fragmentValid: boolean
  isEnabled: boolean
}

const Paragraph = styled.p`
  width: 350px;
`

const Container = styled.div`
  width: 600px;
`

class AlgoliaIndexPopup extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    // if we're editing the AlgoliaSyncQuery
    if (props.node) {
      const {model, indexName, isEnabled, fragment} = props.node

      this.state = {
        title: indexName,
        selectedModel: model,
        fragment,
        fragmentValid: true,
        isEnabled,
      }
    } else {
      const selectedModel = props.project.models.edges[0].node
      this.state = {
        title: '',
        selectedModel,
        fragment: '{\n\tnode {\n\t\tid\n\t}\n}',
        fragmentValid: true,
        isEnabled: true,
      }
    }
  }

  render() {
    const {title, selectedModel, fragment} = this.state
    const {project, algolia, node} = this.props

    return (
      <PopupWrapper onClickOutside={this.close}>
        <div
          className={cx(
            $p.flex,
            $p.justifyCenter,
            $p.itemsCenter,
            $p.h100,
            $p.bgWhite70,
          )}
        >
          <Container
            className={cx(
              $p.bgWhite,
              $p.br2,
              $p.flex,
              $p.buttonShadow,
              $p.flexColumn,
              $p.overflowXHidden,
            )}
          >
            <AlgoliaIndexPopupHeader
              onCancel={this.close}
              onCreate={this.create}
              onUpdate={this.update}
              onDelete={this.delete}
              editing={!!node}
              onTitleChange={this.onTitleChange}
              title={title}
            />
            <div className={cx($p.flex, $p.flexRow)}>
              <AlgoliaIndexPopupModels
                project={project}
                selectedModel={selectedModel}
                onModelSelected={this.selectModel}
                editing={!!node}
              />
              <AlgoliaIndexPopupQuery
                selectedModel={selectedModel}
                onFragmentChange={this.setFragment}
                fragment={fragment}
                algolia={algolia}
              />
            </div>
          </Container>
        </div>
      </PopupWrapper>
    )
  }

  protected onTitleChange = (e: any) => {
    this.setState({title: e.target.value} as State)
  }

  protected selectModel = (model: Model) => {
    this.setState({selectedModel: model} as State)
  }

  protected setFragment = (fragment: string, fragmentValid: boolean) => {
    this.setState({fragment, fragmentValid} as State)
  }

  private close = () => {
    const {params, router} = this.props
    router.push(`/${params.projectName}/integrations/algolia`)
  }

  private validate() {
    const {fragmentValid, title } = this.state

    if (!fragmentValid) {
      alert('Please provide a valid fragment')
      return false
    }

    if (!title || title.length === 0) {
      alert('Please provide a title')
      return false
    }

    return true
  }

  private create = () => {
    const {fragment, fragmentValid, title, selectedModel} = this.state
    const {algolia} = this.props

    if (this.validate()) {
      this.close()
      Relay.Store.commitUpdate(
        new AddAlgoliaSyncQueryMutation({
          modelId: selectedModel.id,
          indexName: title,
          fragment,
          searchProviderAlgoliaId: algolia.id,
        }))
    }

  }

  private update = () => {
    const {fragment, fragmentValid, title, selectedModel, isEnabled} = this.state
    const {node} = this.props

    if (this.validate() && node) {
      this.close()
      Relay.Store.commitUpdate(
        new UpdateAlgoliaSyncQueryMutation({
          algoliaSyncQueryId: node.id,
          indexName: title,
          fragment,
          isEnabled,
        }),
      )
    }
  }

  private delete = () => {
    const {node, algolia} = this.props

    if (node) {
      this.close()
      Relay.Store.commitUpdate(
        new DeleteAlgoliaSyncQueryMutation({
          algoliaSyncQueryId: node.id,
          searchProviderAlgoliaId: algolia.id,
        }),
      )
    }
  }
}

const MappedAlgoliaIndexPopup = mapProps({
  node: props => props.node || null,
  project: props => props.viewer.project,
  algolia: props => {
    const algolias = props.viewer.project.integrations.edges.filter(edge => edge.node.type === 'SEARCH_PROVIDER')
    if (algolias.length > 0) {
      return algolias[0].node
    }

    return null
  },
})(withRouter(AlgoliaIndexPopup))

export const AlgoliaEditIndexPopup = Relay.createContainer(MappedAlgoliaIndexPopup, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    node: () => Relay.QL`
      fragment on Node {
        id
        ... on AlgoliaSyncQuery {
          fragment
          indexName
          isEnabled
          model {
            name
            id
          }
        }
      }
    `,
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          ${AlgoliaIndexPopupModels.getFragment('project')}
          models(first: 100) {
            edges {
              node {
                id
              }
            }
          }
          integrations(first: 100) {
            edges {
              node {
                id
                name
                type
                ... on SearchProviderAlgolia {
                  id
                  ${AlgoliaIndexPopupQuery.getFragment('algolia')}
                }
              }
            }
          }
        }
      }
    `,
  },
})

export const AlgoliaCreateIndexPopup = Relay.createContainer(withRouter(MappedAlgoliaIndexPopup), {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          ${AlgoliaIndexPopupModels.getFragment('project')}
          models(first: 100) {
            edges {
              node {
                id
              }
            }
          }
          integrations(first: 100) {
            edges {
              node {
                id
                name
                type
                ... on SearchProviderAlgolia {
                  id
                  ${AlgoliaIndexPopupQuery.getFragment('algolia')}
                }
              }
            }
          }
        }
      }
    `,
  },
})
