import * as React from 'react'
import {Icon} from 'graphcool-styles'

interface State {
  userConfirmedBreakingChanges: boolean
}

interface Props {
  onCancel?: Function
  className?: string
  numOperations: number
  onConfirmBreakingChanges?: Function
  onResetBreakingChanges?: Function
  showReset?: boolean
  saveLabel?: string
  resync?: boolean
}

export default class ConfirmOperationsPopup extends React.Component<Props, State> {

  state = {
    userConfirmedBreakingChanges: false,
  }

  render() {

    const {numOperations, showReset, resync} = this.props
    const orangeIcon = require('assets/icons/warning_orange.svg')

    return (
      <div className={`container breakingChangesPositioning`}>
        <style jsx={true}>{`

          .container {
            @p: .buttonShadow, .bgWhite, .absolute;
          }

          .breakingChangesPositioning {
            width: 300px;
            bottom: -10px;
            right: 0px;
          }

          .headerText {
            @p: .ml10, .fw6, .f16, .ttu;
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
        <div className={`flex itemsCenter pv10 pl10 headerColorsOrange`}>
          <Icon
            src={orangeIcon}
            width={22}
            height={22}
          />
          <div className={`headerText`}
          >
            Usage Warning
          </div>
        </div>
        <div className='pa25 f16 black50 bb bBlack10'>
          {resync && (
            'Note that all nodes will be resynced with the new query. '
          )}
          Your changes will use up to {numOperations} Operations in Algolia.
        </div>
        {this.generateFooterForBreakingChanges()}
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
        <div>
          {this.props.showReset && (
            <div
              className='pa25 f16 pointer black50'
              onClick={() => this.props.onCancel()}
            >
              Cancel
            </div>
          )}
        </div>
        {!this.state.userConfirmedBreakingChanges ? (<div
            className='confirmButtonOrange'
            onClick={() => this.setState({userConfirmedBreakingChanges: true} as State)}
          >
            Got it
          </div>)
          : (<div
            className='confirmButtonGreen animateChange'
            onClick={() => this.props.onConfirmBreakingChanges()}
          >
            {this.props.saveLabel || 'Save Changes'}
          </div>)}
      </div>
    )
  }
}
