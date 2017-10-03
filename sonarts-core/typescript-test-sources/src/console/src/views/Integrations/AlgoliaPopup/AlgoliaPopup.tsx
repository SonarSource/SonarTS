import * as React from 'react'
import Helmet from 'react-helmet'
import ReactElement = React.ReactElement
import * as Relay from 'react-relay'
import { $p } from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'
import {Viewer, SearchProviderAlgolia} from '../../../types/types'
import PopupWrapper from '../../../components/PopupWrapper/PopupWrapper'
import {withRouter} from 'react-router'
import AlgoliaPopupHeader from './AlgoliaPopupHeader'
import AlgoliaPopupIndexes from './AlgoliaPopupIndexes'
import AlgoliaPopupFooter from './AlgoliaPopupFooter'
import mapProps from '../../../components/MapProps/MapProps'
import UpdateSearchProviderAlgolia from '../../../mutations/UpdateSearchProviderAlgolia'
import {connect} from 'react-redux'
import {showNotification} from '../../../actions/notification'
import {onFailureShowNotification} from '../../../utils/relay'
import {ShowNotificationCallback} from '../../../types/utils'

interface Props {
  viewer: Viewer
  params: any
  router: ReactRouter.InjectedRouter
  algolia: SearchProviderAlgolia
  projectId: string
  showNotification: ShowNotificationCallback
  relay: any
}

interface State {
  valid: boolean
  apiKey: string
  applicationId: string
  isEnabled: boolean
}

const Container = styled.div`
  width: 620px;
`

const ScrollContainer = styled.div`
  max-height: calc(100vh - 103px); // 103px is the height of the footer
`

class AlgoliaPopup extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const {algolia: {apiKey, applicationId, isEnabled}} = props
    this.state = {
      valid: false,
      apiKey,
      applicationId,
      isEnabled,
    }
  }
  render() {
    const {algolia, params, children} = this.props
    const {valid, apiKey, applicationId, isEnabled} = this.state
    return (
      <PopupWrapper onClickOutside={this.close}>
        <Helmet title='Integrations - Algolia' />
        <div
          className={cx(
            $p.flex,
            $p.justifyCenter,
            $p.itemsCenter,
            $p.h100,
            $p.bgWhite80,
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
            <ScrollContainer className={cx($p.overflowYScroll)}>
              <AlgoliaPopupHeader
                apiKey={apiKey}
                applicationId={applicationId}
                isEnabled={isEnabled}
                apiKeyChange={this.apiKeyChange}
                applicationIdChange={this.applicationIdChange}
                isEnabledChange={this.isEnabledChange}
                connected={algolia.isEnabled}
                close={this.close}
              />
              <AlgoliaPopupIndexes algolia={algolia} params={params} />
            </ScrollContainer>
            <AlgoliaPopupFooter
              isValid={valid}
              onCancel={this.close}
              onUpdate={this.update}
            />
          </Container>
        </div>
        {this.props.children}
      </PopupWrapper>
    )
  }

  private apiKeyChange = (e: any) => {
    this.setState({apiKey: e.target.value} as State, this.updateValid)
  }

  private applicationIdChange = (e: any) => {
    this.setState({applicationId: e.target.value} as State, this.updateValid)
  }

  private isEnabledChange = (e: any) => {
    this.setState({isEnabled: !this.state.isEnabled} as State, this.updateValid)
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

  private update = () => {
    const {valid, apiKey, applicationId, isEnabled} = this.state
    const {algolia, projectId} = this.props
    Relay.Store.commitUpdate(
      new UpdateSearchProviderAlgolia({
        searchProviderAlgoliaId: algolia.id,
        isEnabled,
        apiKey,
        applicationId,
        projectId,
      }),
      {
        onSuccess: (transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
        },
        onFailure: (transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
        },
      },
    )
  }
}

const ReduxContainer = connect(null, {
  showNotification,
})(AlgoliaPopup)

const MappedAlgoliaPopup = mapProps({
  projectId: props => props.viewer.project.id,
  algolia: props => {
    const algolias = props.viewer.project.integrations.edges.filter(edge => edge.node.type === 'SEARCH_PROVIDER')
    if (algolias.length > 0) {
      return algolias[0].node
    }

    return null
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
          integrations(first: 100) {
            edges {
              node {
                id
                name
                type
                ... on SearchProviderAlgolia {
                  id
                  isEnabled
                  apiKey
                  applicationId
                  ${AlgoliaPopupIndexes.getFragment('algolia')}
                }
              }
            }
          }
        }
      }
    `,
  },
})
