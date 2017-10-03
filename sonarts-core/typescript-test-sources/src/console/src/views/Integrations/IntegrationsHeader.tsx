import * as React from 'react'
import styled from 'styled-components'
import * as cx from 'classnames'
import {$p} from 'graphcool-styles'

const IntegrationsHeader = () => {
  return (
    <div className={cx($p.ma25)}>
      <h1 className={cx($p.f38, $p.ml0, $p.fw3)}>Integrations</h1>
      <h2 className={cx($p.f16, $p.black40, $p.ml0, $p.fw4)}>Extend your backend with powerful 3rd party services</h2>
    </div>
  )
}

export default IntegrationsHeader
