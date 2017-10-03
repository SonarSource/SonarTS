import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import {Field} from '../../../types/types'
import {valuesMissing} from './FieldPopupState'

interface State {
  enteredFieldName: string
  userConfirmedBreakingChanges: boolean
}

interface Props {
  red: boolean
  onCancel?: Function
  onConfirmBreakingChanges?: Function
  onConfirmDeletion?: Function
  onResetBreakingChanges?: Function
  fieldName?: string
  className?: string
  initialField?: Field
  mutatedField?: Field
}

export default class ConfirmFieldPopup extends React.Component<Props, State> {

  state = {
    enteredFieldName: '',
    userConfirmedBreakingChanges: false,
  }

  render() {

    const {initialField, mutatedField} = this.props

    const redIcon = require('../../../assets/icons/warning_red.svg')
    const orangeIcon = require('../../../assets/icons/warning_orange.svg')

    let onlyNullWilBeReplaced = false
    let allWillBeReplaced = false
    let fieldAndMutationNameWillChange = false
    let enumValueRemoved = false
    let uniqueRemoved = false
    let willBeList = false
    let willBeScalar = false
    let defaultValue = false

    if (initialField && mutatedField) {
      if (initialField.typeIdentifier !== mutatedField.typeIdentifier) {
        allWillBeReplaced = true
      }

      if (!allWillBeReplaced && !initialField.isRequired && mutatedField.isRequired) {
        onlyNullWilBeReplaced = true
      }

      if (initialField.name !== mutatedField.name) {
        fieldAndMutationNameWillChange = true
      }

      enumValueRemoved = valuesMissing(initialField.enumValues, mutatedField.enumValues)

      uniqueRemoved = initialField.isUnique && !mutatedField.isUnique

      willBeList = !initialField.isList && mutatedField.isList

      willBeScalar = initialField.isList && !mutatedField.isList
    }

    defaultValue = !(
      allWillBeReplaced ||
      fieldAndMutationNameWillChange ||
      enumValueRemoved ||
      uniqueRemoved ||
      willBeList ||
      willBeScalar
    )

    return (
      <div className={`container ${this.props.red ? 'deletePositioning' : 'breakingChangesPositioning'}`}>
        <style jsx={true}>{`

          .container {
            @p: .buttonShadow, .bgWhite, .absolute;
          }

          .breakingChangesPositioning {
            max-width: 400px;
            top: -40px;
            right: -100px;
          }

          .deletePositioning {
            max-width: 410px;
            top: -10px;
            left: -75px;
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
          {onlyNullWilBeReplaced && (
            <div>
              Note that null values will be replaced by a migration value.
            </div>
          )}
          {allWillBeReplaced && (
            <div>
              Note that all values will be replaced by the migration value.
            </div>
          )}
          {fieldAndMutationNameWillChange && (
            <div>
              Your changes will break the schema containing your field <b>{this.props.fieldName}</b>.
            </div>
          )}
          {enumValueRemoved && (
            <div>
              Note that you removed enum values, which could be used in Nodes currently.
            </div>
          )}
          {uniqueRemoved && (
            <div>
              Note that you removed the unique constraint, so upsert mutations won't be
              possible with this field anymore.
            </div>
          )}
          {willBeList && (
            <div>
              You're changing the field from a normal scalar field to a list.
              This will break the schema.
              Make sure you provide a <b>migration value.</b>
            </div>
          )}
          {willBeScalar && (
            <div>
              You're changing the field from a list to a single scalar value.
              This will break the schema.
              Make sure you provide a <b>migration value.</b>
            </div>
          )}
          {defaultValue && (
            <div>
              Your changes will break the schema containing your field <b>{this.props.fieldName}</b>.
            </div>
          )}
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
          onClick={(e) => {
            if (typeof this.props.onCancel === 'function') {
               this.props.onCancel()
            }
          }}
        >
          Cancel
        </div>
        {this.props.fieldName === this.state.enteredFieldName ?
          (<button
            className='confirmButtonRed'
            onClick={() => typeof this.props.onConfirmDeletion === 'function' && this.props.onConfirmDeletion()}
            tabIndex={1}
            autoFocus
          >
            Delete
          </button>)
          :
          <input
            className='redBorder inputField'
            value={this.state.enteredFieldName}
            placeholder={`Type the field's name to delete it`}
            onChange={(e: any) => this.setState({enteredFieldName: e.target.value} as State)}
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
