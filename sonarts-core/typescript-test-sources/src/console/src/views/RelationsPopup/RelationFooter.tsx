import * as React from 'react'
import {RelationPopupDisplayState, Model} from '../../types/types'
import {Icon} from 'graphcool-styles'
import ConfirmPopup from './ConfirmPopup'

interface State {
  displayConfirmDeletionPopup: boolean
}

interface Props {
  displayState: RelationPopupDisplayState
  switchDisplayState: Function
  onClickCreateRelation: Function
  onClickEditRelation: Function
  onClickDeleteRelation: Function
  resetToInitialState: Function
  canSubmit: boolean
  close: Function
  isEditingExistingRelation: boolean
  leftModel?: Model
  rightModel?: Model
  relationName?: string
  displayConfirmBreakingChangesPopup: boolean
}

export default class CreateRelationFooter extends React.Component<Props, State> {

  state = {
    displayConfirmDeletionPopup: false,
  }

  render() {
    return (
      <div className='container'>
        <style jsx={true}>{`
          .container {
            @inherit: .flex, .relative, .ph25, .pv16, .justifyBetween, .itemsCenter, .bt, .bBlack10, .bgBlack02;
            height: 77px;
          }
        `}</style>
        {this.generateLeftSideForFooter()}
        {this.props.displayState === 'DEFINE_RELATION' && !this.props.isEditingExistingRelation ?
          this.generateRightSideForFooterForCreatingNewRelation()
          :
          this.generateRightSideForFooterForEditingExistingRelation()
        }
        {this.props.leftModel &&
         this.props.rightModel &&
         this.props.displayConfirmBreakingChangesPopup &&
          <ConfirmPopup
            red={false}
            leftModelName={this.props.leftModel.name}
            rightModelName={this.props.rightModel.name}
            onConfirmBreakingChanges={this.props.onClickEditRelation}
            onResetBreakingChanges={this.props.resetToInitialState}
          />
        }
        {this.props.leftModel &&
         this.props.rightModel &&
         this.state.displayConfirmDeletionPopup &&
          <ConfirmPopup
            red={true}
            onCancel={() => this.setState({displayConfirmDeletionPopup: false} as State)}
            leftModelName={this.props.leftModel.name}
            rightModelName={this.props.rightModel.name}
            relationName={this.props.relationName}
            onConfirmDeletion={this.props.onClickDeleteRelation}
          />
        }
      </div>
    )
  }

  private generateLeftSideForFooter = (): JSX.Element => {
    return (
      <div
        className={`f16 pointer ${this.props.isEditingExistingRelation ? 'red' : 'black50'}`}
        onClick={this.handleDelete}
      >
        {this.props.isEditingExistingRelation ? 'Delete' : 'Cancel'}
      </div>
    )
  }

  private handleDelete = () => {
    if (
      this.props.leftModel &&
      this.props.leftModel.itemCount === 0 &&
      this.props.rightModel && this.props.rightModel.itemCount === 0
    ) {
      this.props.onClickDeleteRelation()
    } else if (this.props.isEditingExistingRelation) {
        this.setState({displayConfirmDeletionPopup: true} as State)
    } else {
      this.props.close()
    }
  }

  private generateRightSideForFooterForCreatingNewRelation = (): JSX.Element => {
    return (
      <div className='flex itemsCenter'>
        <style jsx={true}>{`
          .toggleDisplayStateButton {
            @inherit: .blue, .f14, .fw6, .ttu, .pointer;
          }
          .saveButton {
            @inherit: .white, .bgGreen, .pv10, .ph16, .f16, .pointer, .br2;
          }
        `}</style>
        <div
          className='toggleDisplayStateButton'
          onClick={() => this.props.switchDisplayState('SET_MUTATIONS')}
        >
          Set Relation Name
        </div>
        <Icon
          className='ml6'
          src={require('../../assets/icons/blue_arrow_left.svg')}
          width={17}
          height={12}
          rotate={180}
        />
        <div
          className={`saveButton ml25 ${!this.props.canSubmit && 'o50'}`}
          onClick={
            this.props.canSubmit &&
            (this.props.isEditingExistingRelation ?
              () => this.props.onClickEditRelation()
              :
              () => this.props.onClickCreateRelation()
            )
          }
        >
          {this.props.isEditingExistingRelation ?
            'Update Relation' : 'Create Relation'
          }
        </div>
      </div>
    )
  }

  private generateRightSideForFooterForEditingExistingRelation = (): JSX.Element => {
    return (
      <div className='flex itemsCenter'>
        <style jsx={true}>{`
          .toggleDisplayStateButton {
            @inherit: .blue, .f14, .fw6, .ttu, .pointer;
          }
          .saveButton {
            @inherit: .white, .bgGreen, .pv10, .ph16, .f16, .pointer, .br2;
          }
        `}</style>
        {this.props.displayState === 'SET_MUTATIONS' as RelationPopupDisplayState ?
          <div className={`flex itemsCenter ${this.props.displayConfirmBreakingChangesPopup && 'mr96'}`}>
            <Icon
              className='mr6'
              src={require('../../assets/icons/blue_arrow_left.svg')}
              width={17}
              height={12}
            />
            <div
              className='toggleDisplayStateButton'
              onClick={() => this.props.switchDisplayState('DEFINE_RELATION')}
            >
              Define Relations
            </div>
          </div>
          :
          <div className={`flex itemsCenter ${this.props.displayConfirmBreakingChangesPopup && 'mr96'}`}>
            <div
              className='toggleDisplayStateButton'
              onClick={() => this.props.switchDisplayState('SET_MUTATIONS')}
            >
              Set Relation Name
            </div>
            <Icon
              className='ml6'
              src={require('../../assets/icons/blue_arrow_left.svg')}
              width={17}
              height={12}
              rotate={180}
            />
          </div>
        }
        <div
          className={`saveButton ml25 ${!this.props.canSubmit && 'o50'}`}
          onClick={
                  this.props.canSubmit &&
                  (this.props.isEditingExistingRelation ?
                    () => this.props.onClickEditRelation()
                    :
                    () => this.props.onClickCreateRelation()
                  )
                }
        >
          {this.props.isEditingExistingRelation ?
            'Update Relation' : 'Create Relation'
          }
        </div>
      </div>
    )
  }
}
