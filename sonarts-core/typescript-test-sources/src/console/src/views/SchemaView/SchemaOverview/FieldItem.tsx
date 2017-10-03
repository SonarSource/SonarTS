import * as React from 'react'
import {Field, ModelPermission} from '../../../types/types'
import TypeTag from './TypeTag'
import {Link} from 'react-router'
import PermissionsTag from './PermissionsTag'
import {isScalar} from '../../../utils/graphql'
import {Icon} from 'graphcool-styles'
import Info from '../../../components/Info'

interface Props {
  projectName?: string
  modelName?: string
  field: Field
  hideBorder?: boolean
  permissions: ModelPermission[]
  create?: boolean
}

export interface PermissionMap {
  CREATE: boolean
  READ: boolean
  UPDATE: boolean
  DELETE: boolean
}

export default class FieldItem extends React.Component<Props, null> {
  render() {
    const {field, modelName, projectName, hideBorder, create} = this.props
    const permissions = this.getPermissions()
    const item = (
      <div className={'field-item' + (hideBorder ? '' : ' show-border')}>
        <style jsx>{`
          .field-item {
            @p: .pa16, .flex, .justifyBetween, .nowrap;
          }
          .field-item:hover {
            @p: .bgBlack04;
          }
          .field-item.show-border {
            @p: .bt, .bBlack10;
          }
          .name {
            @p: .fw6, .black60;
          }
          .flexy {
            @p: .flex, .itemsCenter;
          }
          .unique {
            @p: .br2, .ba, .bBlack30, .black30, .f10, .fw7, .ttu, .mr10;
            padding: 3px 4px 3px 4px;
          }
          .flexy :global(.lock) {
            @p: .ml6;
            opacity: 0.75;
          }
          a.underline {
            @p: .underline;
          }
          .wrap {
            @p: .wsNormal;
          }
        `}</style>
        <div className='flexy'>
          <span className='name'>
            {field.name}
          </span>
          {field.isSystem && (
            <Info
              customTip={
                <Icon
                  src={require('assets/icons/lock.svg')}
                  className='lock'
                />
              }
              offsetX={30}
              cursorOffset={-5}
            >
              <div style={{whiteSpace: 'initial'}}>
                {'This is a system field. Read more about system fields '}
                <a
                  href='https://www.graph.cool/docs/reference/platform/system-artifacts-uhieg2shio/'
                  target='_blank'
                  className='underline'
                >
                  {'here'}
                </a>
              </div>
            </Info>
          )}
          <TypeTag field={field} />
        </div>
        <div className='flexy'>
          <div>
            {field.isUnique && (
              <Info
                customTip={
                  <div className='unique'>Unique</div>
                }
                width={180}
                offsetX={-40}
              >
                <div className='wrap'>
                  The content of the field must be unique
                </div>
              </Info>
            )}
          </div>
          {!create && (
            <Link to={`/${projectName}/permissions`}>
              <PermissionsTag
                permissions={permissions}
              />
            </Link>
          )}
        </div>
      </div>
    )
    const element = field.isSystem ? 'div' : Link
    let link = `/${projectName}/schema/${modelName}/edit/${field.name}`
    if (!isScalar(field.typeIdentifier)) {
      link = `/${projectName}/schema/relations/edit/${field.relation.name}`
    }
    return (
      (field.isSystem || create) ? (
        item
      ) : (
        <Link to={link}>
          {item}
        </Link>
      )
    )
  }

  private getPermissions() {
    const {permissions, field} = this.props
    let permissionMap: PermissionMap = {
      CREATE: false,
      READ: false,
      UPDATE: false,
      DELETE: false,
    }

    permissions
      .filter(permission => permission.isActive)
      .forEach(permission => {
        const appliesToFields = permission.applyToWholeModel || permission.fieldIds.includes(field.id)
        permissionMap[permission.operation] = permissionMap[permission.operation] || appliesToFields
      })

    return permissionMap
  }
}
