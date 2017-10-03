import * as React from 'react' // tslint:disable-line
import {$p} from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'

const Container = styled.div`
  height: 103px;
`

export default (props) => (
  <Container className={cx($p.bgGreen, $p.flex, $p.justifyStart, $p.white, $p.itemsCenter)}>
    <div className={cx($p.f25, $p.fw6, $p.flex, $p.flexRow, $p.ml38, $p.itemsCenter)}>
      Generate Code for your
      <div className={cx($p.f25, $p.fw4, $p.bgWhite, $p.green, $p.ph10, $p.br2, $p.ml10)}>
        {props.queryActive ?
          'Query' :
          'Mutation'
        }
      </div>
    </div>
  </Container>
)
