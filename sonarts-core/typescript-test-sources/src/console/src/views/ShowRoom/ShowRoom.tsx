import * as React from 'react' // tslint:disable-line
import {$p} from 'graphcool-styles'
import * as cx from 'classnames'
import PermissionIcon from '../PermissionsView/PermissionsList/ModelPermissions/PermissionIcon'
import NewToggleButton from '../../components/NewToggleButton/NewToggleButton'

const ShowRoom = () => {
  return (
    <div className={cx($p.pa16)}>
      <div>
        <h1>Permission Icons</h1>
        <h2>active</h2>
        <div className={cx($p.flex, $p.flexRow)}>
          {['CREATE', 'READ', 'UPDATE', 'DELETE'].map(operation => (
            <div key={operation} className={$p.mr10}>
              <PermissionIcon operation={operation} isActive={true} />
            </div>
          ))}
        </div>
        <h2>inactive</h2>
        <div className={cx($p.flex, $p.flexRow)}>
          {['CREATE', 'READ', 'UPDATE', 'DELETE'].map(operation => (
            <div key={operation} className={$p.mr10}>
              <PermissionIcon operation={operation} isActive={false} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <h1>Toggle Button</h1>
        <NewToggleButton defaultChecked={true} />
      </div>
    </div>
  )
}

export default ShowRoom
