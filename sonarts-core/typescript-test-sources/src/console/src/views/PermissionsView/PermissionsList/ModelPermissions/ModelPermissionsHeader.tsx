import * as React from 'react'
import * as Relay from 'react-relay'
import mapProps from '../../../../components/MapProps/MapProps'
import {Model, ModelPermission} from '../../../../types/types'
import {Icon, $p, variables} from 'graphcool-styles'
import PermissionIcon from './PermissionIcon'
import * as cx from 'classnames'
import cuid from 'cuid'
import {Link} from 'react-router'

interface Props {
  model: Model
  permissions: ModelPermission[]
  params: any
}

const operations = ['READ', 'UPDATE', 'CREATE', 'DELETE']

class ModelPermissionsHeader extends React.Component<Props, {}> {
  enhancePermissions(permissions: ModelPermission[]) {
    let todo = operations.slice()

    permissions.forEach(permission => {
      if (todo.includes(permission.operation)) {
        const i = todo.indexOf(permission.operation)
        todo.splice(i, 1)
      }
    })

    // create "fake" permissions to show not active permissions in the ui
    return todo.map(operation => ({
      operation,
      isActive: false,
      id: cuid(),
    })).concat(permissions)
  }
  render() {
    const {model, permissions, params} = this.props
    const enhancedPermissions = this.enhancePermissions(permissions)
    return (
      <div className={cx($p.flex, $p.flexRow, $p.justifyBetween, $p.itemsCenter)}>
        <div className={cx($p.flex, $p.flexRow, $p.itemsCenter)}>
          <h2 className={cx($p.black50, $p.fw4, $p.ph6, $p.bgWhite)}>{model.name}</h2>
          <div className={cx($p.flex, $p.flexRow, $p.ph6, $p.bgWhite, $p.ml16)}>
            {enhancedPermissions.map((permission, index) =>
              (
                <PermissionIcon
                  key={permission.id}
                  operation={permission.operation}
                  isActive={permission.isActive}
                  className={cx(
                    {
                      [$p.ml6]: index !== 0,
                    },
                  )}
                />
              ),
            )}
          </div>
        </div>
        <div className={cx($p.flex, $p.flexRow, $p.itemsCenter)}>
          <Link className={cx($p.ml25)} to={`/${params.projectName}/permissions/${model.name}/create`}>
            <div
              className={cx(
                $p.f14,
                $p.pa10,
                $p.pointer,
                $p.ttu,
                $p.bgWhite,
                $p.black50,
                $p.lhSolid,
                $p.fw6,
                $p.buttonShadow,
                $p.tracked,
                $p.flex,
                $p.flexRow,
              )}
            >
              <Icon
                src={require('graphcool-styles/icons/stroke/add.svg')}
                stroke={true}
                strokeWidth={2}
                color={variables.gray50}
              />
              New Permission
            </div>
          </Link>

        </div>
      </div>
    )
  }
}

const MappedPermissionsList = mapProps({
  model: props => props.model,
  permissions: props => props.model.permissions.edges.map(edge => edge.node),
})(ModelPermissionsHeader)

export default Relay.createContainer(MappedPermissionsList, {
  fragments: {
    model: () => Relay.QL`
      fragment on Model {
        name
        permissions(first: 100) {
          edges {
            node {
              id
              isActive
              operation
            }
          }
        }
      }
    `,
  },
})
