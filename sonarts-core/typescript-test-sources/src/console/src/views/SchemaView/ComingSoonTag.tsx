import * as React from 'react'
import * as cx from 'classnames'
import { $p, $g, $v } from 'graphcool-styles'
import styled from 'styled-components'

const Root = styled.div`
  margin-bottom: -${parseFloat($v.size10)}px;
`

interface Props {
}

export default class ComingSoonTag extends React.Component<Props, {}> {

  render() {

    return (
      <Root className={cx($g.uppercaseLabel, $p.pa6, $p.bgWhite04, $p.white30, $p.f12, $p.br2, $p.ml6, $p.mb0)}>
        coming soon
      </Root>
    )
  }
}
