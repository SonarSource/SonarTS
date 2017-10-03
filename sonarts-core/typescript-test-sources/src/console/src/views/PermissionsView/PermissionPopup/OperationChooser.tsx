import * as React from 'react'
import {Operation} from '../../../types/types'
import * as cx from 'classnames'
import {$p, Icon, variables} from 'graphcool-styles'
import styled from 'styled-components'
import ErrorInfo from '../../models/FieldPopup/ErrorInfo'
import {PermissionPopupErrors} from './PermissionPopupState'

interface Props {
  setOperation: (operation: Operation) => void
  selectedOperation: Operation
  errors: PermissionPopupErrors
  showErrors: boolean
}

const operations = [
  {
    icon: require('graphcool-styles/icons/stroke/editAddSpaced.svg'),
    text: 'Create',
    operation: 'CREATE',
  },
  {
    icon: require('graphcool-styles/icons/stroke/viewSpaced.svg'),
    text: 'Read',
    operation: 'READ',
  },
  {
    icon: require('graphcool-styles/icons/stroke/editSpaced.svg'),
    text: 'Update',
    operation: 'UPDATE',
  },
  {
    icon: require('graphcool-styles/icons/stroke/deleteSpaced.svg'),
    text: 'Delete',
    operation: 'DELETE',
  },
]

export default class OperationChooser extends React.Component<Props, {}> {
  render() {
    const {selectedOperation, setOperation} = this.props

    return (
      <div className={$p.pb38}>
        <style jsx>{`
          .placeholder {
            @p: .absolute, .overflowHidden;
            top: 50%;
            transform: translateY(-50%);
            left: 0px;
            width: 10px;
            height: 37px;
          }
          .bar {
            @p: .br2, .ph10, .bgBlue, .relative;
            left: -10px;
            height: 100%;
          }
          .operation-error {
            @p: .absolute;
            margin-top: -30px;
            right: -30px;
          }
          .operations {
            @p: .bgBlack04, .inlineFlex, .flexRow, .justifyCenter, .ph16, .pv6, .relative, .itemsCenter, .w100;
            height: 37px;
          }
          .operation-button {
            @p: .nowrap, .flex, .itemsCenter, .relative, .mh16, .pointer, .pv6;
          }
          .operation-button:not(.active):hover {
            @p: .bgBlack04;
          }
          .operation-button.active {
            @p: .bgBlue, .br2, .ph10, .pv8;
            top: 0;
            bottom: -2px;
          }
          h2 {
            @p: .fw3, .mb10, .tl;
          }
          .description {
            @p: .black50, .tl;
          }
        `}</style>
        <div
          className={cx($p.ph38, $p.pb38)}
        >
          <h2>Operation</h2>
          <div className='description'>
            The operation that will be allowed by this permission.
          </div>
        </div>
        <div className='operations'>
          {selectedOperation === null && (
            <div className='placeholder'>
              <div className='bar' />
            </div>
          )}
          {operations.map(operation => (
            <div
              key={operation.operation}
              className={cx('operation-button', {active: operation.operation === selectedOperation})}
              onClick={() => setOperation(operation.operation as Operation)}
            >
              <Icon
                stroke={true}
                strokeWidth={2}
                src={operation.icon}
                color={operation.operation === selectedOperation ? variables.white : variables.gray30}
                width={23}
                height={23}
              />
              <div
                className={cx($p.ml6, $p.ttu, $p.fw6, $p.f14, {
                    [$p.black30]: operation.operation !== selectedOperation,
                    [$p.white]: operation.operation === selectedOperation,
                  },
                )}
              >
                {operation.text}
              </div>
            </div>
          ))}
        </div>
        {this.props.errors.permissionTypeMissing && this.props.showErrors && (
          <div className='operation-error'>
            <ErrorInfo>
              Please specify the operation that this permission should affect.
            </ErrorInfo>
          </div>
        )}
      </div>
    )
  }
}
