import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {connect} from 'react-redux'
import {ReduxAction} from '../../types/reducers'
import {closePopup} from '../../actions/popup'
import styled from 'styled-components'
import {$p, variables} from 'graphcool-styles'
import * as cx from 'classnames'
import {validateModelName} from '../../utils/nameValidator'
import tracker from '../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'

interface Props {
  id: string
  modelName: string
  closePopup: (id: string) => ReduxAction
  saveModel: (modelName: string) => ReduxAction
  deleteModel: () => ReduxAction
}

interface State {
  showError: boolean
}

class EditModelPopup extends React.Component<Props, State> {

  refs: {
    input: HTMLInputElement,
  }

  state = {
    showError: false,
  }

  componentDidMount() {
    tracker.track(ConsoleEvents.Schema.Model.Popup.opened({type: 'Update'}))
  }

  render() {

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
      bottom: -44px
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

    const DeleteButton = styled(Button)`
      background: ${variables.red};
      color: ${variables.white};

      &:hover {
        color: ${variables.white};
      }
    `

    const SaveButton = styled(Button)`
      background: ${variables.green};
      color: ${variables.white};

      &:hover {
        color: ${variables.white};
      }
    `

    return (
      <div
        className={cx(
          $p.flex,
          $p.bgBlack50,
          $p.w100,
          $p.h100,
          $p.justifyCenter,
          $p.itemsCenter,
        )}
      >
        <style jsx={true}>{`
          .popup {
            @inherit: .bgWhite, .br2;
            pointer-events: all;
            width: 600px;
            max-width: 90%;
          }
        `}</style>
        <div className='popup'>
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
                className={cx(
                  $p.fw3,
                  $p.f38,
                  $p.bNone,
                  $p.lhSolid,
                  $p.tl,
                )}
                type='text'
                autoFocus
                placeholder='Model Name...'
                defaultValue={this.props.modelName}
                onKeyDown={e => e.keyCode === 13 && this.saveModel()}
                ref='input'
              />
            </div>

          </div>
          <div
            className={cx(
              $p.bt,
              $p.bBlack10,
              $p.pa25,
              $p.flex,
              $p.justifyBetween,
            )}
          >
            <DeleteButton onClick={this.deleteModel}>
              Delete
            </DeleteButton>
            <div>
              <SaveButton onClick={this.saveModel}>
                Save
              </SaveButton>
              <Button onClick={() => {
                this.props.closePopup(this.props.id)
                tracker.track(ConsoleEvents.Schema.Model.Popup.canceled({type: 'Update'}))
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  private deleteModel = () => {
    this.props.deleteModel()
    this.props.closePopup(this.props.id)
    tracker.track(ConsoleEvents.Schema.Model.Popup.deleted({type: 'Update'}))
  }

  private saveModel = () => {
    const modelName = (ReactDOM.findDOMNode(this.refs.input) as HTMLInputElement).value

    tracker.track(ConsoleEvents.Schema.Model.Popup.submitted({type: 'Update', name: modelName}))
    if (modelName != null && !validateModelName(modelName)) {
      this.setState({showError: true} as State)
      return
    }

    this.props.saveModel(modelName)
    this.props.closePopup(this.props.id)
  }

}

export default connect(
  null,
  {
    closePopup,
  },
)(EditModelPopup)
