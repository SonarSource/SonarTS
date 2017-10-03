import * as React from 'react'
import * as Relay from 'react-relay'
import {ModelPermission, Model} from '../../../../types/types'
import {$p, variables, Icon} from 'graphcool-styles'
import * as cx from 'classnames'
import NewToggleButton from '../../../../components/NewToggleButton/NewToggleButton'
import PermissionLabel from './PermissionLabel'
import ModelPermissionFields from './ModelPermissionFields'
import styled from 'styled-components'
import {Link, withRouter} from 'react-router'
import ToggleActivePermissionMutation from '../../../../mutations/ModelPermission/ToggleActivePermissionMutation'
import tracker from '../../../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'

interface Props {
  permission: ModelPermission
  model: Model
  params: any
}

const Container = styled.div`
  height: 60px;
  &:not(:last-child) {
    border-bottom: 1px solid ${variables.gray07};
  }
`

const PermissionType = styled.div`
  width: 170px;
  min-width: 170px;
`

const Arrow = styled.div`
  &:before {
    width: calc(100% - 20px);
    height: 1px;
    position: absolute;
    border-bottom: 1px solid ${variables.gray20};
    top: 3px;
    right: 7px;
    content: "";
  }
`

class ModelPermissionComponent extends React.Component<Props, {}> {
  render() {
    const {permission, model, params: {projectName}} = this.props
    return (
      <Container
        className={cx(
          $p.flex,
          $p.flexRow,
          $p.justifyBetween,
          $p.itemsCenter,
        )}
      >
        <Link
          className={cx($p.flex, $p.flexRow, $p.overflowHidden, $p.flex1, $p.itemsCenter)}
          to={`/${projectName}/permissions/${model.name}/edit/${permission.id}`}
        >
          <PermissionType className={cx(
            $p.flex,
            $p.flexRow,
            $p.itemsCenter,
            $p.justifyBetween,
            $p.relative,
          )}>
            <h3 className={cx($p.black50, $p.f16, $p.fw6)}>
              {permission.userType === 'EVERYONE' ? 'Everyone' : 'Authenticated'}
            </h3>
            <Arrow className={cx(
              $p.justifyEnd,
              $p.flex,
              $p.flexRow,
              $p.flexAuto,
              $p.relative,
            )}>
              <Icon
                src={require('graphcool-styles/icons/fill/triangle.svg')}
                color={variables.gray20}
                width={6}
                height={7}
              />
            </Arrow>
          </PermissionType>
          <PermissionLabel isActive={permission.isActive} operation={permission.operation} className={$p.ml10} />
          {['READ', 'CREATE', 'UPDATE'].includes(permission.operation) && (
            <ModelPermissionFields permission={permission} model={model} />
          )}
        </Link>
        <div>
          <NewToggleButton defaultChecked={permission.isActive} onChange={this.toggleActiveState} />
        </div>
      </Container>
    )
  }

  private toggleActiveState = () => {
    const {permission} = this.props
    Relay.Store.commitUpdate(
      new ToggleActivePermissionMutation({id: permission.id, isActive: !permission.isActive}),
      {
        onFailure: (transaction) => console.log(transaction),
      },
    )
    tracker.track(ConsoleEvents.Permissions.toggled({active: !permission.isActive}))
  }
}

export default Relay.createContainer(withRouter(ModelPermissionComponent), {
  fragments: {
    permission: () => Relay.QL`
      fragment on ModelPermission {
        id
        operation
        userType
        fieldIds
        isActive
        ${ModelPermissionFields.getFragment('permission')}
      }
    `,
    model: () => Relay.QL`
      fragment on Model {
        id
        name
        ${ModelPermissionFields.getFragment('model')}
      }
    `,
  },
})
