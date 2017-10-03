import * as React from 'react'
import {Relation} from '../../../types/types'
import NewToggleButton from '../../../components/NewToggleButton/NewToggleButton'
import RelationPermissionLabel from '../RelationPermissionsList/RelationPermissions/RelationPermissionLabel'

interface Props {
  relation: Relation
  connect: boolean
  disconnect: boolean
  toggleConnect: () => void
  toggleDisconnect: () => void
}

export default function RelationBaseSettings({connect, disconnect, toggleConnect, toggleDisconnect}: Props) {
  return (
    <div className='relation-base-settings'>
      <style jsx={true}>{`
        .relation-base-settings {
          @p: .pl38, .pr38, .pb38;
        }
        .intro {
          @p: .black50;
        }
        .labels {
          @p: .flex, .mt25;
        }
      `}</style>
      <div className='intro'>
        The operations that will be allowed by this permission. (Multiple selection possible.)
      </div>

      <div className='labels'>
        <RelationPermissionLabel
          operation='connect'
          isActive={connect}
          onClick={toggleConnect}
          editable
        />
        <RelationPermissionLabel
          operation='disconnect'
          isActive={disconnect}
          onClick={toggleDisconnect}
          className='ml16'
          editable
        />
      </div>
    </div>
  )
}
