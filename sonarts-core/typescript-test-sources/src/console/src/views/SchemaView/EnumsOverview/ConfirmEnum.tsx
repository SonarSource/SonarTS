import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'

interface State {
  enteredModelName: string
  userConfirmedBreakingChanges: boolean
}

interface Props {
  delete?: boolean
  onCancel?: Function
  onConfirmBreakingChanges?: Function
  onConfirmDeletion?: Function
  onResetBreakingChanges?: Function
  className?: string
  initialModelName?: string
  mutatedModelName?: string
}

export default class ConfirmModel extends React.Component<Props, State> {

  state = {
    enteredModelName: '',
    userConfirmedBreakingChanges: false,
  }

  render() {

    const {initialModelName, mutatedModelName} = this.props

    const redIcon = require('../../../assets/icons/warning_red.svg')
    const orangeIcon = require('../../../assets/icons/warning_orange.svg')

    return (
      <div className={`container ${this.props.delete ? 'deletePositioning' : 'breakingChangesPositioning'}`}>
        <style jsx={true}>{`

          .container {
            @p: .buttonShadow, .bgWhite, .absolute, .z2;
          }

          .breakingChangesPositioning {
            max-width: 400px;
            top: -40px;
            right: -10px;
          }

          .deletePositioning {
            max-width: 410px;
            top: -40px;
            left: -10px;
          }

          .headerText {
            @p: .ml10, .fw6, .f16, .ttu;
          }

          .headerColorsRed {
            color: rgba(242,92,84,1);
            background-color: rgba(242,92,84,.2);
          }

          .headerColorsOrange{
            color: rgba(241,143,1,1);
            background-color: rgba(241,143,1,.2);
          }

          .confirmButtonOrange {
            @p: .white, .ma16, .ph25, .pv10, .f16, .br2, .pointer;
            background-color: rgba(241,143,1,1);
          }

        `}</style>
        <div className={`flex itemsCenter pv10 pl10 ${this.props.delete ? 'headerColorsRed' : 'headerColorsOrange'}`}>
          <Icon
            src={this.props.delete ? redIcon : orangeIcon}
            width={22}
            height={22}
          />
          <div className={`headerText`}
          >
            {this.props.delete ? 'Data Loss' : 'Breaking Changes'}
          </div>
        </div>
        <div className='pa25 f16 black50 bb bBlack10'>
          {this.props.delete ? (
              <div>
                You are deleting the model <b>{initialModelName}</b>.
              This will result in data loss.
              </div>
            ) : (
              <div>
                You are renaming the model <b>{initialModelName}</b> to <b>{mutatedModelName}</b>.
              Please be aware, that this could break your application.
              </div>
            )}
        </div>
        {this.props.delete ? this.generateFooterForDeletion() : this.generateFooterForBreakingChanges()}
      </div>
    )
  }

  private generateFooterForDeletion = (): JSX.Element => {
    return (
      <div className='flex justifyBetween bgBlack04'>
        <style jsx={true}>{`
          .confirmButtonRed {
            @p: .white, .ma16, .ph25, .pv10, .f16, .br2, .pointer;
            background-color: rgba(242,92,84,1);
          }

          .redBorder {
            @p: .ba, .br2;
            border-color: rgba(242,92,84,1);
          }

          .inputModel {
            @p: .bgTransparent, .w100, .mv16, .mr16, .ph10;
            color: rgba(242,92,84,1);
          }

        `}</style>
        <div
          className='pa25 f16 pointer black50'
          onClick={(e) => {
            if (typeof this.props.onCancel === 'function') {
               this.props.onCancel()
            }
          }}
        >
          Cancel
        </div>
        {this.props.initialModelName === this.state.enteredModelName ?
          (<div
            className='confirmButtonRed'
            onClick={() => typeof this.props.onConfirmDeletion === 'function' && this.props.onConfirmDeletion()}
          >
            Delete
          </div>)
          :
          <input
            className='redBorder inputModel'
            value={this.state.enteredModelName}
            placeholder={`Type the model's name to delete it`}
            onChange={(e: any) => this.setState({enteredModelName: e.target.value} as State)}
            autoFocus={true}
          />}
      </div>
    )
  }

  private generateFooterForBreakingChanges = (): JSX.Element => {
    return (
      <div className='flex justifyBetween bgBlack04'>
        <style jsx={true}>{`

          .confirmButtonOrange {
            @p: .white, .ma16, .ph25, .pv10, .f16, .br2, .pointer;
            background-color: rgba(241,143,1,1);
          }

          .confirmButtonGreen {
            @p: .bgGreen, .white, .ma16, .ph25, .pv10, .f16, .br2, .pointer;
          }

          .animateChange {
            transition: .35s linear all;
          }

        `}</style>
        <div
          className='pa25 f16 pointer black50'
          onClick={() => typeof this.props.onResetBreakingChanges === 'function' && this.props.onResetBreakingChanges()}
        >
          Reset
        </div>
        {!this.state.userConfirmedBreakingChanges ? (<div
            className='confirmButtonOrange'
            onClick={() => this.setState({userConfirmedBreakingChanges: true} as State)}
          >
            Got it
          </div>)
          : (<div
              className='confirmButtonGreen animateChange'
              onClick={() =>  {
              if (typeof this.props.onConfirmBreakingChanges === 'function') {
                this.props.onConfirmBreakingChanges()
              }
            }}
            >
              Save Changes
            </div>
          )}
      </div>
    )
  }
}
