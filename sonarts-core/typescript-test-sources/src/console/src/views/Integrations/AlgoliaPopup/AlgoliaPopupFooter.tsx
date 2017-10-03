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
  isValid: boolean
  onCancel: () => void
  onUpdate: (e: any) => void
}

export default ({onCancel, isValid, onUpdate}: Props) => (
  <Container className={cx($p.flex, $p.justifyBetween, $p.white, $p.itemsCenter, $p.bt, $p.ph25)}>
    <div onClick={onCancel} className={cx($p.black50, $p.pointer)}>Cancel</div>
    {isValid && (
      <Button
        className={cx(
          $p.ml25,
          $p.pa16,
          $p.f16,
          $p.white,
          $p.br2,
          $p.bgGreen,
          $p.pointer,
        )}
        onClick={(e: any) => {
          if (!isValid) {
            return
          }
          onUpdate(e)
        }}
      >
        Update
      </Button>
    )}
  </Container>
)
