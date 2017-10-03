import * as React from 'react'
import styled from 'styled-components'
import {Link} from 'react-router'
import * as cx from 'classnames'
import {$p, Icon} from 'graphcool-styles'

interface Integration {
  isEnabled: boolean,
  logoURI?: string,
  description: string
  link: string
  logo?: any
}

interface Props {
  integration: Integration
}

const LinkCard = styled(Link)`
  width: 317px;
  height: 322px;
`

const ConnectionCheckmark = styled.div`
  width: 30px;
  height: 30px;
  background-color: #27AE60;
`

const Logo = styled.img`
  height: 54px;
`

export default class IntegrationsCard extends React.Component<Props, {}> {
  render() {
    const {integration} = this.props
    return (
      <LinkCard
        className={cx($p.flex, $p.flexColumn, $p.pa38, $p.bgWhite, $p.buttonShadow, $p.mt25, $p.ml25)}
        to={integration.link}
      >

        {/*
        <div className={cx($p.w100, $p.flex, $p.flexRow, $p.justifyEnd)}>
          <ConnectionCheckmark
            className={cx(
              $p.br100,
              $p.flex,
              $p.itemsCenter,
              $p.justifyCenter,
            )}
          >
            <Icon
              src={require('../../assets/icons/check.svg')}
              color='#fff'
            />
          </ConnectionCheckmark>
        </div>
         */}
        <div
          className={cx(
            $p.tc,
            $p.flex,
            $p.flexColumn,
            $p.justifyAround,
            $p.h100,
            $p.sansSerif,
          )}
        >
          <div>
            {integration.logo ? (
              integration.logo
            ) : (
              <Logo src={integration.logoURI} alt='integration-logo' />
            )}
          </div>
          <div className={cx($p.black50, $p.mt16)}>
            {integration.description}
          </div>
          <div className={cx($p.flex, $p.flexRow, $p.justifyCenter, $p.itemsCenter, $p.mt38)}>
            {typeof integration.isEnabled === 'boolean' && (
              <div
                className={cx(
                  $p.ttu,
                  $p.br2,
                  $p.f14,
                  $p.pv4,
                  $p.ph10,
                  $p.br2,
                  $p.pointer,
                  {
                    [`${$p.green} ${$p.bgGreen20}`]: integration.isEnabled,
                    [`${$p.white} ${$p.bgBlue}`]: !integration.isEnabled,
                  },
                )}
              >
                {integration.isEnabled ? 'Enabled' : 'Not Enabled'}
              </div>
            )}
          </div>
        </div>

      </LinkCard>
    )
  }
}
