import * as React from 'react'
import {Icon, $v} from 'graphcool-styles'
import {Field} from '../../../types/types'
import Tether from '../../../components/Tether/Tether'

interface Props {
  onSelectIndex: (index: number) => void
  activeTabIndex: number
  tabs: string[]
  valid: boolean
  create: boolean
  changed: boolean
  onDelete: () => void
  onCancel: (e: any) => void
  onSubmit: any
}

export default class PermissionPopupFooter extends React.Component<Props, null> {
  render() {
    const {
      activeTabIndex,
      tabs,
      onSelectIndex,
      valid,
      create,
      onSubmit,
      changed,
      onDelete,
      onCancel,
    } = this.props

    return (
      <div className='permission-popup-footer'>
        <style jsx>{`
          .permission-popup-footer {
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
              <div className='delete' onClick={onDelete}>
                Delete
              </div>
            </div>
          )}
        <div className='buttons'>
          <div
            className='prev'
            onClick={() => onSelectIndex(activeTabIndex - 1)}
          >
            {activeTabIndex > 0 && (
              <Icon
                src={require('../../../assets/icons/blue_arrow_left.svg')}
                stroke
                strokeWidth={2}
                width={13}
                height={13}
              />
            )}
            {activeTabIndex > 0 && (
              <div
                className='prev-name'
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
              <div className='next-name'>
                {tabs[activeTabIndex + 1]}
              </div>
            )}
            {activeTabIndex < (tabs.length - 1) && (
              <Icon
                src={require('../../../assets/icons/blue_arrow_left.svg')}
                stroke
                strokeWidth={2}
                width={13}
                height={13}
                rotate={180}
              />
            )}
          </div>
          {((!create && changed) || (create && activeTabIndex === (tabs.length - 1))) && (
            <div className={'button' + (valid ? ' active' : '')} onClick={onSubmit}>
              {create ? 'Create' : 'Update'} Permission
            </div>
          )}
        </div>
      </div>
    )
  }
}

// divider as in design for less space, maybe needed later
// {activeTabIndex > 0 && activeTabIndex < 0 && (
//   <div className="divider">
//   </div>
// )}
