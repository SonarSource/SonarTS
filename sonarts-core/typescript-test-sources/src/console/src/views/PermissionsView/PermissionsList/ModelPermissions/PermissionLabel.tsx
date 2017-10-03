import * as React from 'react' // tslint:disable-line
import * as cx from 'classnames'
import {$p, variables} from 'graphcool-styles'
import styled from 'styled-components'
import {Operation} from '../../../../types/types'
import {texts} from '../../../../utils/permission'

function getTagSettings(operation: Operation) {
  switch (operation) {
    case 'READ':
      return {
        text: texts.READ,
        color: variables.pblue,
        containerClass: cx($p.bgPblue20),
      }
    case 'CREATE':
      return {
        text: texts.CREATE,
        color: variables.pgreen,
        containerClass: cx($p.bgPlightgreen50),
      }
    case 'UPDATE':
      return {
        text: texts.UPDATE,
        color: variables.pbrown,
        containerClass: cx($p.bgPyellow40),
      }
    case 'DELETE':
      return {
        text: texts.DELETE,
        color: variables.pred,
        containerClass: cx($p.bgPred20),
      }
    default:
      return null
  }
}

const PermissionLabel = (props) => {
  const {operation, isActive, className} = props

  const {text, color, containerClass} = getTagSettings(operation)

  const Text = styled.div`
    color: ${color};
  `

  return (
    <div className={cx('container', $p.br1, $p.ph6, $p.dib, $p.nowrap, $p.fw6, containerClass, className, {
      [$p.o50]: !isActive,
    })}>
      <Text>{text}</Text>
    </div>
  )
}

export default PermissionLabel
