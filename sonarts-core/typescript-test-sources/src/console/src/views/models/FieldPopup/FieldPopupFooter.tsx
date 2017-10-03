import * as React from 'react'
import {Icon, $v} from 'graphcool-styles'
import ConfirmPopup from './ConfirmFieldPopup'
import ConfirmFieldPopup from './ConfirmFieldPopup'
import {Field} from '../../../types/types'
import Tether from '../../../components/Tether/Tether'

interface Props {
  onSelectIndex: (index: number) => void
  activeTabIndex: number
  tabs: string[]
  valid: boolean
  create: boolean
  onSubmit: any
  changed: boolean
  needsMigrationIndex: number
  breaking?: boolean
  name: string
  onConfirmBreakingChanges: Function
  onReset: Function
  onDelete: Function
  onCancel: (e: any) => void
  onDeletePopupVisibilityChange: (visible: boolean) => void
  initialField?: Field
  mutatedField: Field
  nodeCount: number
}

interface State {
  showDeletePopup: boolean
}

export default class FieldPopupFooter extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      showDeletePopup: false,
    }
  }

  render() {
    const {
      activeTabIndex,
      tabs,
      onSelectIndex,
      valid,
      create,
      onSubmit,
      changed,
      needsMigrationIndex,
      breaking,
      name,
      onConfirmBreakingChanges,
      onReset,
      onDelete,
      onCancel,
      mutatedField,
      initialField,
      nodeCount,
    } = this.props
    const {showDeletePopup} = this.state

    return (
      <div className='field-popup-footer'>
        <style jsx>{`
          .field-popup-footer {
            @p: .bbox, .bgBlack02, .bt, .bBlack10, .pr16, .flex, .justifyBetween, .itemsCenter, .relative;
            height: 80px;
            padding-left: 30px;
          }
          .cancel, .delete {
            @p: .f16, .black50, .pointer;
          }
          .cancel {
            @p: .black50;
          }
          .delete {
            @p: .red;
          }
          .next-name, .prev-name {
            @p: .ttu, .fw6, .f14, .blue, .blue;
            letter-spacing: 0.53px;
          }
          .prev-name {
            @p: .ml10;
          }
          .next-name {
            @p: .mr10;
          }
          .prev {
            @p: .o60;
          }
          .divider {
            @p: .mh16;
            border: 1px solid rgba(42,126,211,0.3);
            height: 30px;
          }
          .prev, .next, .buttons {
            @p: .flex, .itemsCenter;
          }
          .next, .prev {
            @p: .pointer;
          }
          .next {
            @p: .ml25;
          }
          .button {
            @p: .bgBlack07, .black30, .f16, .ph16, .br2, .ml25;
            cursor: no-drop;
            padding-top: 9px;
            padding-bottom: 10px;
          }
          .button.active {
            @p: .bgGreen, .white, .pointer;
          }
          .next-name.needs-migration, .prev-name.needs-migration {
            @p: .lightOrange;
          }
        `}</style>
        {create ? (
            <div className='cancel' onClick={onCancel}>
              Cancel
            </div>
          ) : (
            <div>
              <div className='delete' onClick={this.handleShowDeletePopup}>
                Delete
              </div>
              {showDeletePopup && (
                <ConfirmFieldPopup
                  red={true}
                  fieldName={name}
                  onConfirmDeletion={onDelete}
                  onCancel={this.handleCloseDeletePopup}
                />
              )}
            </div>
          )}
        <div className='buttons'>
          <div
            className='prev'
            onClick={() => onSelectIndex(activeTabIndex - 1)}
          >
            {activeTabIndex > 0 && (
              needsMigrationIndex === activeTabIndex - 1 ? (
                  <Icon
                    src={require('../../../assets/icons/orange_arrow_left.svg')}
                    stroke
                    strokeWidth={2}
                    width={13}
                    height={13}
                  />
                ) : (
                  <Icon
                    src={require('../../../assets/icons/blue_arrow_left.svg')}
                    stroke
                    strokeWidth={2}
                    width={13}
                    height={13}
                  />
                )
            )}
            {activeTabIndex > 0 && (
              <div
                className={'prev-name' + ((needsMigrationIndex === activeTabIndex - 1) ? ' needs-migration' : '')}
              >
                {tabs[activeTabIndex - 1]}
              </div>
            )}
          </div>
          <div
            className='next'
            onClick={() => onSelectIndex(activeTabIndex + 1)}
          >
            {activeTabIndex < (tabs.length - 1) && (
              <div className={'next-name' + ((needsMigrationIndex === activeTabIndex + 1) ? ' needs-migration' : '')}>
                {tabs[activeTabIndex + 1]}
              </div>
            )}
            {activeTabIndex < (tabs.length - 1) && (
              needsMigrationIndex === activeTabIndex + 1 ? (
                  <Icon
                    src={require('../../../assets/icons/orange_arrow_left.svg')}
                    stroke
                    strokeWidth={2}
                    width={13}
                    height={13}
                    rotate={180}
                  />
                ) : (
                  <Icon
                    src={require('../../../assets/icons/blue_arrow_left.svg')}
                    stroke
                    strokeWidth={2}
                    width={13}
                    height={13}
                    rotate={180}
                  />
                )
            )}
          </div>
          {((!create && changed) || (create)) && (
            breaking ? (
                <ConfirmFieldPopup
                  red={false}
                  fieldName={name}
                  onConfirmBreakingChanges={onConfirmBreakingChanges}
                  onResetBreakingChanges={onReset}
                  initialField={initialField}
                  mutatedField={mutatedField}
                />
              ) : (
                <Tether
                  steps={[
                    {
                      step: 'STEP2_CLICK_CONFIRM_IMAGEURL',
                      title: `That's it, click create!`,
                    },
                    {
                      step: 'STEP2_CLICK_CONFIRM_DESCRIPTION',
                      title: `That's it, click create!`,
                    },
                  ]}
                  offsetX={5}
                  offsetY={5}
                  width={240}
                  zIndex={2000}
                >
                  <div className={'button' + (valid ? ' active' : '')} onClick={onSubmit}>
                    {create ? 'Create' : 'Update'} Field
                  </div>
                </Tether>
              )
          )}
        </div>
      </div>
    )
  }

  private handleCloseDeletePopup = () => {
    this.props.onDeletePopupVisibilityChange(false)
    this.setState({showDeletePopup: false})
  }

  private handleShowDeletePopup = () => {
    if (this.props.nodeCount === 0) {
      this.props.onDelete()
    } else {
      this.props.onDeletePopupVisibilityChange(true)
      this.setState({showDeletePopup: true})
    }
  }
}

// divider as in design for less space, maybe needed later
// {activeTabIndex > 0 && activeTabIndex < 0 && (
//   <div className="divider">
//   </div>
// )}
