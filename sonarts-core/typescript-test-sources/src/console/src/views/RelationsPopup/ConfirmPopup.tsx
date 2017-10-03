import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'

interface State {
  enteredRelationName: string
  userConfirmedBreakingChanges: boolean
}

interface Props {
  red: boolean
  onCancel?: Function
  onConfirmBreakingChanges?: Function
  onConfirmDeletion?: Function
  onResetBreakingChanges?: Function
  leftModelName: string
  rightModelName: string
  className?: string
  relationName?: string
}

export default class ConfirmPopup extends React.Component<Props, State> {

  state = {
    enteredRelationName: '',
    userConfirmedBreakingChanges: false,
  }

  render() {

    const redIcon = require('../../assets/icons/warning_red.svg')
    const orangeIcon = require('../../assets/icons/warning_orange.svg')

    return (
      <div className={`container ${this.props.red ? 'deletePositioning' : 'breakingChangesPositioning'}`}>
        <style jsx={true}>{`

          .container {
            @p: .buttonShadow, .bgWhite, .absolute;
          }

          .breakingChangesPositioning {
            max-width: 300px;
            top: -10px;
            right: -25px;
          }

          .deletePositioning {
            max-width: 410px;
            top: -10px;
            left: -25px;
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
        <div className={`flex itemsCenter pv10 pl10 ${this.props.red ? 'headerColorsRed' : 'headerColorsOrange'}`}>
          <Icon
            src={this.props.red ? redIcon : orangeIcon}
            width={22}
            height={22}
          />
          <div className={`headerText`}
          >
            {this.props.red ? 'Data Loss' : 'Breaking Changes'}
          </div>
        </div>
        <div className='pa25 f16 black50 bb bBlack10'>
          This change might break queries or mutations for this relation
          <span className='fw6'> {this.props.relationName} </span>
        </div>
        {this.props.red ? this.generateFooterForDeletion() : this.generateFooterForBreakingChanges()}
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

          .inputField {
            @p: .bgTransparent, .w100, .mv16, .mr16, .ph10;
            color: rgba(242,92,84,1);
          }

        `}</style>
        <div
          className='pa25 f16 pointer black50'
          onClick={() => this.props.onCancel()}
        >
          Cancel
        </div>
        {this.props.relationName === this.state.enteredRelationName ?
          (<button
            className='confirmButtonRed'
            onClick={() => this.props.onConfirmDeletion()}
            tabIndex={1}
            autoFocus
          >
            Delete
          </button>)
          :
          <input
            className='redBorder inputField'
            value={this.state.enteredRelationName}
            placeholder={`Type the relation's name to delete it`}
            onChange={(e: any) => this.setState({enteredRelationName: e.target.value} as State)}
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
          onClick={() => this.props.onResetBreakingChanges()}
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
            onClick={() => this.props.onConfirmBreakingChanges()}
          >
            Save Changes
          </div>)}
      </div>
    )
  }
}
