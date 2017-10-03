import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {connect} from 'react-redux'
import styled from 'styled-components'
import {$p, $v} from 'graphcool-styles'
import * as cx from 'classnames'
import {validateModelName} from '../../utils/nameValidator'
import tracker from '../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'
import AddModelMutation from '../../mutations/AddModelMutation'
import * as Relay from 'react-relay'
import * as Modal from 'react-modal'
import {onFailureShowNotification} from '../../utils/relay'
import {showNotification} from '../../actions/notification'
import {ShowNotificationCallback} from '../../types/utils'
import {showDonePopup, nextStep} from '../../actions/gettingStarted'
import {GettingStartedState} from '../../types/gettingStarted'
import modalStyle from '../../utils/modalStyle'

interface Props {
  onRequestClose: () => void
  projectId: string
  // injected by redux
  showNotification: ShowNotificationCallback
  showDonePopup: () => void
  nextStep: () => Promise<any>
  gettingStartedState: GettingStartedState
}

interface State {
  showError: boolean
}

const customModalStyle = {
  overlay: modalStyle.overlay,
  content: {
    ...modalStyle.content,
    width: 500,
  },
}

class AddModelPopup extends React.Component<Props, State> {

  refs: {
    input: HTMLInputElement,
  }

  state = {
    showError: false,
  }

  componentDidMount() {
    tracker.track(ConsoleEvents.Schema.Model.Popup.opened({type: 'Create'}))
  }

  render() {

    const Popup = styled.div`
      width: 600px;
      max-width: 90%;
    `

    const NameInput = styled.input`
      &::-webkit-input-placeholder {
      color: ${$v.gray20};
      opacity: 1;
    }
      &::-moz-placeholder {
        color: ${$v.gray20};
        opacity: 1;
      }
      &:-ms-input-placeholder {
        color: ${$v.gray20};
        opacity: 1;
      }
      &:-moz-placeholder {
        color: ${$v.gray20};
        opacity: 1;
      }
    `

    const Warning = styled.div`
      bottom: -44px
    `

    const Button = styled.button`
      padding: ${$v.size16};
      font-size: ${$v.size16};
      border: none;
      background: none;
      color: ${$v.gray50};
      border-radius: 2px;
      cursor: pointer;
      transition: color ${$v.duration} linear;

      &:hover {
        color: ${$v.gray70};
      }
    `

    const SaveButton = styled(Button)`
      background: ${$v.green};
      color: ${$v.white};

      &:hover {
        color: ${$v.white};
      }
    `

    return (
      <Modal
        isOpen
        contentLabel='Add Model'
        onRequestClose={this.props.onRequestClose}
        style={customModalStyle}
      >
        <div className={$p.bgWhite}>
          <div className={cx($p.relative, $p.pa60)}>
            <div className={cx($p.relative)}>
              {this.state.showError && (
                <Warning
                  className={cx(
                  $p.absolute,
                  $p.left0,
                  $p.orange,
                  $p.f14,
                )}
                >
                  Models must begin with an uppercase letter and only contain letters and numbers
                </Warning>
              )}
              <NameInput
                className={cx($p.fw3, $p.f38, $p.bNone, $p.lhSolid, $p.tl)}
                type='text'
                autoFocus
                placeholder='New Model...'
                defaultValue=''
                onKeyDown={e => e.keyCode === 13 && this.saveModel()}
                ref='input'
              />
            </div>

          </div>
          <div
            className={cx($p.bt, $p.bBlack10, $p.pa25, $p.flex, $p.justifyBetween)}
          >
            <Button onClick={() => {
              this.props.onRequestClose()
              tracker.track(ConsoleEvents.Schema.Model.Popup.canceled({type: 'Create'}))
            }}>
              Cancel
            </Button>
            <SaveButton onClick={this.saveModel}>
              Create
            </SaveButton>
          </div>
        </div>
      </Modal>
    )
  }

  private saveModel = () => {
    const modelName = (ReactDOM.findDOMNode(this.refs.input) as HTMLInputElement).value
    if (modelName != null && !validateModelName(modelName)) {
      this.setState({showError: true} as State)
      return
    }

    this.addModel(modelName)
    this.props.onRequestClose()
    tracker.track(ConsoleEvents.Schema.Model.Popup.submitted({type: 'Create', name: modelName}))
  }

  private addModel = (modelName: string) => {
    const redirect = () => {
      // this.setState({
      //   addingNewModel: false,
      //   newModelIsValid: true,
      // } as State)
    }
    if (modelName) {
      Relay.Store.commitUpdate(
        new AddModelMutation({
          modelName,
          projectId: this.props.projectId,
        }),
        {
          onSuccess: () => {
            tracker.track(ConsoleEvents.Schema.Model.created({modelName}))
            if (
              modelName === 'Post' &&
              this.props.gettingStartedState.isCurrentStep('STEP1_CREATE_POST_MODEL')
            ) {
              this.props.showDonePopup()
              this.props.nextStep().then(redirect)
            } else {
              redirect()
            }
          },
          onFailure: (transaction) => {
            onFailureShowNotification(transaction, this.props.showNotification)
          },
        },
      )
    }
  }
}

export default connect(
  state => ({gettingStartedState: state.gettingStarted.gettingStartedState}),
  {
    showNotification, nextStep, showDonePopup,
  },
)(AddModelPopup)
