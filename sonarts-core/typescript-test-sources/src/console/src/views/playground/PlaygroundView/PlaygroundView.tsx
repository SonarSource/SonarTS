import * as React from 'react'
import * as Relay from 'react-relay'
import Helmet from 'react-helmet'
import PopupWrapper from '../../../components/PopupWrapper/PopupWrapper'
import { Lokka } from 'lokka'
import { Transport } from 'lokka-transport-http'
import GraphiQL from 'graphiql'
import { Viewer, User, Project } from '../../../types/types'
import { saveQuery } from '../../../utils/QueryHistoryStorage'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import QueryHistory from '../../../components/QueryHistory/QueryHistory'
import {Icon} from 'graphcool-styles'
import * as cookiestore from 'cookiestore'
import endpoints from '../../../utils/endpoints'
import { sideNavSyncer } from '../../../utils/sideNavSyncer'
import LoginClientUserMutation from '../../../mutations/LoginClientUserMutation'
import {GettingStartedState} from '../../../types/gettingStarted'
import {nextStep, previousStep} from '../../../actions/gettingStarted'
const classes: any = require('./PlaygroundView.scss')
import * as cx from 'classnames'
import {$p} from 'graphcool-styles'
import {Popup} from '../../../types/popup'
import {showPopup} from '../../../actions/popup'
import cuid from 'cuid'
import CodeGenerationPopup from './CodeGenerationPopup/CodeGenerationPopup'
import tracker from '../../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'
import Playground from 'graphcool-graphiql'
import getSubscriptionEndpoint from '../../../utils/region'
import Tether from '../../../components/Tether/Tether'

const DASHBOARD_ADMIN = {
  id: 'ADMIN',
}

const GUEST = {
  id: 'EVERYONE',
}

const DEFAULT_QUERY = `{
  allUsers {
    id
  }
}`

const ONBOARDING_QUERY_PART1 = `{
  allPosts {
    imageUrl
    description
  }
}`

const ONBOARDING_QUERY_PART2 = `{
  allPosts(filter: {
    description_contains: "#graphcool"
  }) {
    imageUrl
    description
  }
}`

type Endpoint = 'SIMPLE' | 'RELAY'

interface Props {
  viewer: Viewer & { project: Project, userModel: any }
  params: any
  gettingStartedState: GettingStartedState
  nextStep: () => any
  previousStep: () => any
  showPopup: (popup: Popup) => void
}
interface State {
  users: User[]
  historyVisible: boolean
  query: string | undefined
  variables: string | undefined
  selectedEndpoint: Endpoint
  selectedUserId: string
  selectedUserToken: string
  adminToken: string
  lastQuerySuccessful: boolean
  lastQuery: string
}

class PlaygroundView extends React.Component<Props, State> {

  private lokka: any
  private guestLokka: any
  private id: string

  constructor (props: Props) {
    super(props)

    const clientEndpoint = `${__BACKEND_ADDR__}/relay/v1/${this.props.viewer.project.id}`
    const token = cookiestore.get('graphcool_auth_token')
    const headers = {
      Authorization: `Bearer ${token}`,
      'x-graphcool-source': 'console:playground:user-list',
    }
    const transport = new Transport(clientEndpoint, { headers })
    const guestTransport = new Transport(clientEndpoint)

    this.lokka = new Lokka({ transport })
    this.guestLokka = new Lokka({ transport: guestTransport })

    const usedPlayground = window.localStorage.getItem(`used-playground-${this.props.viewer.project.id}`)
    // const isOnboarding = props.gettingStartedState.isCurrentStep('STEP4_WAITING_PART2')
    const isOnboarding = true

    this.state = {
      users: [DASHBOARD_ADMIN, GUEST],
      historyVisible: false,
      query: isOnboarding ? ONBOARDING_QUERY_PART1 : usedPlayground ? undefined : DEFAULT_QUERY,
      variables: undefined,
      selectedEndpoint: (window.localStorage.getItem('SELECTED_ENDPOINT') || 'SIMPLE') as Endpoint,
      selectedUserId: DASHBOARD_ADMIN.id,
      selectedUserToken: null,
      adminToken: token,
      lastQuerySuccessful: false,
      lastQuery: '',
    }

  }

  componentDidUpdate (nextProps: Props) {
    // if (this.props.gettingStartedState.step !== nextProps.gettingStartedState.step) {
    //   if (nextProps.gettingStartedState.isCurrentStep('STEP4_WAITING_PART2') ||
    //       nextProps.gettingStartedState.isCurrentStep('STEP4_CLICK_TEASER_PART2')) {
    //     this.setState({
    //       query: ONBOARDING_QUERY_PART1,
    //     } as State)
    //   }
    //   if (nextProps.gettingStartedState.isCurrentStep('STEP4_CLICK_TEASER_STEP5')) {
    //     this.setState({
    //       query: ONBOARDING_QUERY_PART2,
    //     } as State)
    //   }
    // }
  }

  componentWillMount () {
    if (this.props.viewer.userModel) {
      const query = `
        {
          viewer {
            allUsers {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `
      this.lokka.query(query)
        .then((results) => {
          const users = results.viewer.allUsers.edges.map((edge) => edge.node)
          this.setState({ users: [DASHBOARD_ADMIN, GUEST, ...users] } as State)
        })
    }
  }

  componentDidMount () {
    tracker.track(ConsoleEvents.Playground.viewed())
  }

  getEndpoint () {
    return `${__BACKEND_ADDR__}/${endpoints[this.state.selectedEndpoint].alias}/${this.props.viewer.project.id}`
  }

  handleResponse = (graphQLParams, response) => {
    if (!response.ok && !graphQLParams.query.includes('IntrospectionQuery')) {
      tracker.track(ConsoleEvents.Playground.queryRan({type: 'Fail'}))
    }
    if (response.ok && !graphQLParams.query.includes('IntrospectionQuery')) {
      tracker.track(ConsoleEvents.Playground.queryRan({type: 'Success'}))
    }

    if (graphQLParams.query.includes('mutation')) {
      // update side nav item count when we did a mutation
      sideNavSyncer.notifySideNav()
    }
  }

  render () {

    const {project} = this.props.viewer
    const subscriptionsEndpoint = getSubscriptionEndpoint(project.region)
    const step = this.props.gettingStartedState.skipped ? undefined : this.props.gettingStartedState.step

    return (
      <div className={classes.root}>
        <Helmet title='Playground' />
        <style jsx={true}>{`
          div :global(.onboarding-hint) {
            @p: .pa0, .bgNone;
          }
        `}</style>
        <Playground
          adminAuthToken={this.state.adminToken}
          projectId={this.props.viewer.project.id}
          onSuccess={this.handleResponse}
          httpApiPrefix={__BACKEND_ADDR__}
          wsApiPrefix={subscriptionsEndpoint + '/v1'}
          onboardingStep={step}
          tether={Tether}
          nextStep={this.props.nextStep}
        />
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    gettingStartedState: state.gettingStarted.gettingStartedState,
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ nextStep, previousStep, showPopup }, dispatch)
}

const MappedPlaygroundView = connect(mapStateToProps, mapDispatchToProps)(PlaygroundView)

export default Relay.createContainer(MappedPlaygroundView, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          id
          region
        }
        userModel: modelByName(projectName: $projectName, modelName: "User"){
          id
        }
      }
    `,
  },
})

// httpApiPrefix={__BACKEND_ADDR__}
