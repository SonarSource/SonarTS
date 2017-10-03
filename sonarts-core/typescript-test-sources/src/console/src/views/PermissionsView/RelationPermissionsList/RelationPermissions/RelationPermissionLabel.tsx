import * as React from 'react' // tslint:disable-line
import * as cx from 'classnames'
import {$p, variables} from 'graphcool-styles'
import styled from 'styled-components'

export type RelationPermissionType = 'connect' | 'disconnect'

function getTagSettings(operation: RelationPermissionType) {
  switch (operation) {
    case 'connect':
      return {
        text: 'Connect',
        color: variables.pgreen,
        containerClass: cx($p.bgPlightgreen50),
      }
    case 'disconnect':
      return {
        text: 'Disconnect',
        color: variables.pred,
        containerClass: cx($p.bgPred20),
      }
    default:
      return null
  }
}

interface Props {
  operation: RelationPermissionType
  onClick?: () => void
  isActive?: boolean
  className?: string
  editable?: boolean
}

const RelationPermissionLabel = (props: Props) => {
  const {operation, isActive, onClick, className, editable} = props

  const {text, color, containerClass} = getTagSettings(operation)

  const Text = styled.div`
    color: ${color};
  `

  return (
    <div
      className={cx('relation-permission-label', className, containerClass, {
        active: isActive,
        editable,
      })}
      onClick={onClick}
    >
      <style jsx>{`
        .relation-permission-label {
          @p: .br1, .ph6, .dib, .nowrap, .fw6, .o50;
        }
        .relation-permission-label.editable {
          @p: .pointer, .pa10;
        }
        .relation-permission-label.active {
          @p: .o100;
        }
        .relation-permission-label.editable.active:hover {
          @p: .o90;
        }
      `}</style>
      <Text>{text}</Text>
    </div>
  )
}

export default RelationPermissionLabel
