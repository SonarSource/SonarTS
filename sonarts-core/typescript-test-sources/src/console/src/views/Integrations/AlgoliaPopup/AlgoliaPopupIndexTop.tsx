import * as React from 'react' // tslint:disable-line
import {$p, Icon, variables} from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'
import {Link} from 'react-router'

interface Props {
  params: any
}

const Queries = styled.div`
  margin-top: -3px;
  padding-bottom: 41px;
`

export default ({params}: Props) => (
  <div className={cx($p.flex, $p.flexRow)}>
    <div className={cx($p.bt, $p.bBlack10, $p.pa38, $p.w50)}>
      <div className={cx($p.f16, $p.black30, $p.ttu)}>Indexes</div>
      <Link
        className={cx($p.blue, $p.fw3, $p.f25, $p.mt38, $p.pointer)}
        to={`/${params.projectName}/integrations/algolia/create`}
      >+ add new index</Link>
    </div>
    <Queries className={cx($p.br2, $p.brTop, $p.brLeft, $p.bgDarkBlue, $p.pa38, $p.w50)}>
      <div className={cx($p.f16, $p.white30, $p.ttu)}>Queries</div>
    </Queries>
  </div>
)
