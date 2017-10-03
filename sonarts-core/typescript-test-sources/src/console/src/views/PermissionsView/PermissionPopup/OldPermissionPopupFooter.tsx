import * as React from 'react' // tslint:disable-line
import {$p, variables} from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'

const Container = styled.div`
  height: 103px;
`

const Button = styled.button`
  transition: color ${variables.duration} linear;

  &:hover {
    opacity: 0.7;
  }
`

interface Props {
  isEditing: boolean
  isValid: boolean
  onDelete: (e: any) => void
  onCancel: (e: any) => void
  onUpdate: (e: any) => void
  onCreate: (e: any) => void
}

const PermissionPopupFooter = ({isEditing, onDelete, onCancel, isValid, onUpdate, onCreate}: Props) => (
  <Container className={cx($p.flex, $p.justifyBetween, $p.white, $p.itemsCenter, $p.bt, $p.ph25)}>
    {isEditing ? (
        <div onClick={onDelete} className={cx($p.red, $p.pointer)}>Delete</div>
      ) : (
        <div></div>
      )}
    <div className={cx($p.flex, $p.flexRow, $p.itemsCenter)}>
      <div onClick={onCancel} className={cx($p.black50, $p.pointer)}>Cancel</div>
      <Button
        className={cx(
          $p.ml25,
          $p.pa16,
          $p.f16,
          $p.white,
          $p.br2,
          {
            [cx($p.bgBlack10, $p.noEvents)]: !isValid,
            [cx($p.bgGreen, $p.pointer)]: isValid,
          },
        )}
        onClick={(e: any) => {
          if (!isValid) {
            return
          }

          if (isEditing) {
            onUpdate(e)
          } else {
            onCreate(e)
          }
        }}
      >
        {isEditing ? (
            'Update'
          ) : (
            'Create'
          )}
      </Button>
    </div>
  </Container>
)

export default PermissionPopupFooter
