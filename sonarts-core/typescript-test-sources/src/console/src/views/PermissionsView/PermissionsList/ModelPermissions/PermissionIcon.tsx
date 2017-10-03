import * as React from 'react' // tslint:disable-line
import * as cx from 'classnames'
import {$p, Icon, variables} from 'graphcool-styles'
import styled from 'styled-components'
import {Operation} from '../../../../types/types'
import {icons} from '../../../../utils/permission'

function getIconSettings(operation: Operation) {
  switch (operation) {
    case 'READ':
      return {
        icon: {
          src: icons.READ,
          color: variables.pblue,
        },
        containerClass: cx($p.bgPblue20),
      }
    case 'CREATE':
      return {
        icon: {
          src: icons.CREATE,
          color: variables.pgreen,
        },
        containerClass: cx($p.bgPlightgreen50),
      }
    case 'UPDATE':
      return {
        icon: {
          src: icons.UPDATE,
          color: variables.pbrown,
        },
        containerClass: cx($p.bgPyellow40),
      }
    case 'DELETE':
      return {
        icon: {
          src: icons.DELETE,
          color: variables.pred,
        },
        containerClass: cx($p.bgPred20),
      }
    default:
      return null
  }
}

const Container = styled.div`
  width: 26px;
  height: 26px;
`

const DisabledContainer = styled(Container)`
  &:after {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: ${variables.gray10};
    transform: rotate(-45deg);
  }
`

const PermissionIcon = (props) => {
  const {operation, isActive, className} = props

  const ContainerClass = isActive ? Container : DisabledContainer
  let {icon, containerClass} = getIconSettings(operation)

  let inactiveColor = {}
  if (!isActive) {
    delete icon.color
    inactiveColor = {
      color: variables.gray30,
    }

    containerClass = cx($p.ba, $p.bBlack10)
  }

  return (
    <ContainerClass
      className={cx($p.flex, $p.relative, $p.itemsCenter, $p.justifyCenter, $p.br100, containerClass, className)}
    >
      <Icon {...icon} {...inactiveColor} stroke={true} strokeWidth={2} width={24} height={24} />
    </ContainerClass>
  )
}

export default PermissionIcon
