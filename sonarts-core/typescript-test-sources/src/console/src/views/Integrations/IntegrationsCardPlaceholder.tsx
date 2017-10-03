import * as React from 'react'
import styled from 'styled-components'
import * as cx from 'classnames'
import {$p} from 'graphcool-styles'

const Card = styled.div`
  width: 317px;
  height: 322px;
`

const LogoPlaceholder = styled.div`
  width: 173px;
  height: 30px;
`

const IntegrationsCardPlaceholder = () => {
  return (
    <Card className={cx(
      $p.flex,
      $p.flexColumn,
      $p.itemsCenter,
      $p.justifyCenter,
      $p.bgBlack04,
      $p.mt25,
      $p.ml25,
    )}>
      <div className={cx($p.w60, $p.hS38, $p.mb38, $p.bgBlack04)} />

      <div className={cx($p.w50, $p.hS16, $p.mb4, $p.bgBlack04)} />
      <div className={cx($p.w60, $p.hS16, $p.mb4, $p.bgBlack04)} />
      <div className={cx($p.w40, $p.hS16, $p.mb4, $p.bgBlack04)} />
    </Card>
  )
}

export default IntegrationsCardPlaceholder
