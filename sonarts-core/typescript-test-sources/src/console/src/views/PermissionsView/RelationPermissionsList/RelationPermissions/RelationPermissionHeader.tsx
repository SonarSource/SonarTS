import * as React from 'react'
import {Link} from 'react-router'
import {Icon, $v} from 'graphcool-styles'
import {Relation} from '../../../../types/types'

interface Props {
  relation: Relation
  params: any
}

export default function ({relation, params}: Props) {
  return (
    <div className='relation-permission-header'>
      <style jsx>{`
        .relation-permission-header {
          @p: .relative, .ph16, .flex, .justifyBetween;
        }
        .relation-permission-header:before {
          width: 100%;
          height: 1px;
          position: absolute;
          border-bottom: 1px solid $gray07;
          top: 19px;
          content: "";
          z-index: -1;
        }
        h2 {
          @p: .black50, .fw4, .bgWhite, .ph6;
        }
        .btn {
          @p: .f14, .pa10, .pointer, .ttu, .bgWhite, .black50, .lhSolid, .fw6, .buttonShadow, .tracked, .flex;
        }
      `}</style>
      <h2>{relation.name}</h2>
      <Link to={`/${params.projectName}/permissions/relations/${relation.name}/create`}>
        <div className='btn'>
          <Icon
            src={require('graphcool-styles/icons/stroke/add.svg')}
            stroke={true}
            strokeWidth={2}
            color={$v.gray50}
          />
          New Permission
        </div>
      </Link>
    </div>
  )
}
