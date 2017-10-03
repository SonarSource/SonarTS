import * as React from 'react' // tslint:disable-line
import {$p, Icon, variables} from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'
import {icons, texts} from '../../../utils/permission'

const Container = styled.div`
  height: 103px;
`

export default (props) => (
  <Container className={cx($p.bgGreen, $p.flex, $p.justifyStart, $p.white, $p.itemsCenter)}>
    <div className={cx($p.f25, $p.fw6, $p.flex, $p.flexRow, $p.ml38, $p.itemsCenter)}>
      {props.editing ? (
        <div className={cx($p.flex, $p.flexRow, $p.itemsCenter)}>
          <Icon
            src={icons[props.operation]}
            stroke={true}
            strokeWidth={2}
            width={40}
            height={40}
            color={variables.white}
          />
          <div className={$p.ml6}>
            {texts[props.operation]}
          </div>
          <div className={cx($p.fw3, $p.ml6)}>in</div>
        </div>
      ) : (
        'New Permission for'
      )}
      <div className={cx($p.f25, $p.fw4, $p.bgWhite, $p.green, $p.ph10, $p.br2, $p.ml10)}>
        {props.params.modelName}
      </div>
    </div>
  </Container>
)
