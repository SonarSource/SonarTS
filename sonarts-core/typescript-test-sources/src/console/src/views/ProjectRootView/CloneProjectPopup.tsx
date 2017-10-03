import * as React            from 'react'
import * as Relay            from 'react-relay'
import {connect}             from 'react-redux'
import {ConsoleEvents}       from 'graphcool-metrics'
import * as cx               from 'classnames'
import styled                from 'styled-components'
import {withRouter}          from 'react-router'
import {
  $p,
  variables,
  Icon,
}                            from 'graphcool-styles'

import {validateProjectName} from '../../utils/nameValidator'
import tracker               from '../../utils/metrics'

import mapProps              from '../../components/MapProps/MapProps'

import CloneProjectMutation  from '../../mutations/CloneProjectMutation'
import Checkbox              from '../../components/Form/Checkbox'
import Loading from '../../components/Loading/Loading'
import {showNotification} from '../../actions/notification'
import {onFailureShowNotification} from '../../utils/relay'
import {ShowNotificationCallback} from '../../types/utils'
import * as Modal from 'react-modal'
import {fieldModalStyle} from '../../utils/modalStyle'

interface Props {
  router: ReactRouter.InjectedRouter
  params: any
  projectId: string
  customerId: string
  showNotification: ShowNotificationCallback
}

interface State {
  showError: boolean
  projectName: string
  includeData: boolean
  includeMutationCallbacks: boolean
  loading: boolean
}

const NameInput = styled.input`
  &::-webkit-input-placeholder {
  color: ${variables.gray20};
  opacity: 1;
}
  &::-moz-placeholder {
    color: ${variables.gray20};
    opacity: 1;
  }
  &:-ms-input-placeholder {
    color: ${variables.gray20};
    opacity: 1;
  }
  &:-moz-placeholder {
    color: ${variables.gray20};
    opacity: 1;
  }
`

const Warning = styled.div`
  bottom: -44px;
`

const Button = styled.button`
  padding: ${variables.size16};
  font-size: ${variables.size16};
  border: none;
  background: none;
  color: ${variables.gray50};
  border-radius: 2px;
  cursor: pointer;
  transition: color ${variables.duration} linear;

  &:hover {
    color: ${variables.gray70};
  }
`

const CloneButton = styled(Button)`
  background: ${variables.green};
  color: ${variables.white};

  &:hover {
    color: ${variables.white};
  }
`

const MiniHeadline = styled.div`
  margin-top: -13px;
`

const NestedCheckboxes = styled.div`
  padding-left: 12px;
`

const modalStyling = {
  ...fieldModalStyle,
  content: {
    ...fieldModalStyle.content,
    width: 620,
  },
}

class CloneProjectPopup extends React.Component<Props, State> {
  state = {
    showError: false,
    projectName: '',
    includeData: true,
    includeMutationCallbacks: false,
    loading: false,
  }

  componentDidMount() {
    tracker.track(ConsoleEvents.Project.ClonePopup.opened())
  }

  render() {
    const { projectName } = this.props.params

    return (
      <Modal
        isOpen
        contentLabel='Clone Project'
        onRequestClose={this.close}
        style={modalStyling}
      >
        <div className={cx($p.relative, $p.pa60, $p.bb, $p.bBlack20 )}>
          <div className={cx($p.relative)}>
            {this.state.showError && (
              <Warning
                className={cx($p.absolute, $p.left0, $p.orange, $p.f14)}
              >
                A project name has to start with a capital letter
                and may only contain alphanumeric characters and spaces.
              </Warning>
            )}
            <NameInput
              className={cx($p.fw3, $p.f38, $p.bNone, $p.lhSolid, $p.tl)}
              type='text'
              autoFocus
              placeholder={`Clone of ${projectName}...`}
              onKeyDown={e => e.keyCode === 13 && this.cloneProject()}
              value={this.state.projectName}
              onChange={this.onProjectNameChange}
            />
          </div>
        </div>
        <MiniHeadline className={cx($p.tc)}>
          <p className={cx($p.dib, $p.f16, $p.fw3, $p.bgWhite, $p.ph16, $p.relative)}>
            Clone Settings
          </p>
        </MiniHeadline>
        <div className={cx($p.pa60, $p.f25, $p.fw3)}>
          <Checkbox
            checked={true}
            label='Schema'
          />
          <NestedCheckboxes>
            <Checkbox
              checked={this.state.includeData}
              onClick={this.onIncludeDataToggle}
              nested={true}
              label='Data'
              forceHighlightVerticalLine={this.state.includeMutationCallbacks}
            />
            <Checkbox
              checked={this.state.includeMutationCallbacks}
              onClick={this.onIncludeMutationCallbacksToggle}
              nested={true}
              label='Mutation Callbacks'
            />
          </NestedCheckboxes>
        </div>
        <div
          className={cx($p.bt, $p.bBlack10, $p.pa25, $p.flex, $p.justifyBetween)}
        >
          <Button onClick={this.onCancelClick}>
            Cancel
          </Button>
          <CloneButton onClick={this.cloneProject}>
            Clone
          </CloneButton>
        </div>
        <style jsx>{`
          .loading {
            @p: .left0, .top0, .right0, .bottom0, .bgWhite80, .flex, .itemsCenter, .justifyCenter, .z2;
            @p: .h100, .w100, .absolute;
          }
        `}</style>
        {this.state.loading && (
          <div className='loading'>
            <Loading />
          </div>
        )}
      </Modal>
    )
  }

  private close = () => {
    this.props.router.goBack()
  }

  private onCancelClick = () => {
    tracker.track(ConsoleEvents.Project.ClonePopup.canceled())

    this.closePopup()
  }

  private onProjectNameChange = (e: any) => {
    this.setState({ projectName: e.target.value } as State)
  }

  private onIncludeDataToggle = () => {
    this.setState({ includeData: !this.state.includeData } as State)
  }

  private onIncludeMutationCallbacksToggle = () => {
    this.setState({ includeMutationCallbacks: !this.state.includeMutationCallbacks } as State)
  }

  private closePopup = () => {
    this.props.router.goBack()
  }

  private cloneProject = () => {
    const { projectId, customerId } = this.props
    const { projectName, includeData, includeMutationCallbacks, loading } = this.state

    if (loading) {
      return
    }

    if (projectName != null && !validateProjectName(projectName)) {
      this.setState({showError: true} as State)

      // Don't submit as long as name is invalid
      return
    }

    tracker.track(ConsoleEvents.Project.ClonePopup.submitted({
      name: projectName,
      includeData,
      includeMutationCallbacks,
    }))

    this.setState({loading: true} as State, () => {
      Relay.Store.commitUpdate(
        new CloneProjectMutation({
          projectId,
          name: projectName,
          customerId,
          includeData,
          includeMutationCallbacks,
        }),
        {
          onSuccess: () => {
            tracker.track(ConsoleEvents.Project.cloned({ name: projectName }))

            const {router} = this.props

            router.push(`/${projectName}`)
          },
          onFailure: (transaction) => {
            onFailureShowNotification(transaction, this.props.showNotification)
          },
        },
      )
    })
  }
}

const ReduxContainer = connect(null, {showNotification})(CloneProjectPopup)

const MappedCloneProjectPopup = mapProps({
  projectId: props => props.viewer.project.id,
  customerId: props => props.viewer.user.id,
})(ReduxContainer)

export default Relay.createContainer(withRouter(MappedCloneProjectPopup), {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        user { id }
        project: projectByName(projectName: $projectName) { id }
      }
    `,
  },
})
