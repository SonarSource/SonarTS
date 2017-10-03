import * as React from 'react'
import {Icon, $v} from 'graphcool-styles'
import {icons} from '../../../utils/permission'
import {PermissionMap} from './FieldItem'
import Info from '../../../components/Info'

interface Props {
  permissions: PermissionMap
}

export default class PermissionsTag extends React.Component<Props,null> {
  render() {
    const {permissions: {CREATE, READ, UPDATE, DELETE}} = this.props
    const hasPermission = (READ || CREATE || UPDATE || DELETE)
    return (
      <div>
        <style jsx>{`
          .permissions-tag {
            @p: .bgBlack04, .pa4, .flex, .itemsCenter;
            height: 21px;
            border-radius: 11px;
          }
          .item {
            @p: .mt6;
            padding: 1px 5px;
          }
          .create {
            @p: .bgPlightgreen50;
            color: $pgreen;
          }
          .read {
            @p: .bgPblue20;
            color: $pblue;
          }
          .update {
            @p: .brown, .bgPyellow40;
          }
          .delete {
            @p: .bgPred20;
            color: $pred;
          }
          .wrap {
            @p: .wsNormal;
          }
        `}</style>
        <Info
          padding={
            hasPermission ? 6 : undefined
          }
          width={
            hasPermission ? 'auto' : 165
          }
          offsetX={
            hasPermission ? -10 : -70
          }
          cursorOffset={
            hasPermission ? 20 : -8
          }
          customTip={(
            <div className='permissions-tag'>
              {!hasPermission && (
                <Icon
                  src={require('graphcool-styles/icons/fill/permissions.svg')}
                  width={14}
                  height={14}
                  color={$v.gray40}
                />
              )}
              {CREATE && (
                <Icon
                  src={require('graphcool-styles/icons/stroke/addFull.svg')}
                  stroke
                  strokeWidth={6}
                  width={16}
                  height={16}
                  color={$v.gray40}
                />
              )}
              {READ && (
                <Icon src={icons['READ']} stroke strokeWidth={3} width={20} height={20} color={$v.gray40} />
              )}
              {UPDATE && (
                <Icon src={icons['UPDATE']} stroke strokeWidth={3} width={20} height={20} color={$v.gray40} />
              )}
              {DELETE && (
                <Icon src={icons['DELETE']} stroke strokeWidth={3} width={20} height={20} color={$v.gray40} />
              )}
            </div>
          )}
        >
          {hasPermission ? (
            <div>
              <div>Permissions</div>
              {CREATE && (
                <div className='item create'>Create Data</div>
              )}
              {READ && (
                <div className='item read'>Read Data</div>
              )}
              {UPDATE && (
                <div className='item update'>Update Data</div>
              )}
              {DELETE && (
                <div className='item delete'>Delete Data</div>
              )}
            </div>
          ) : (
            <div className='wrap'>
              There are no permissions defined for this field
            </div>
          )}
        </Info>
      </div>
    )
  }
}
