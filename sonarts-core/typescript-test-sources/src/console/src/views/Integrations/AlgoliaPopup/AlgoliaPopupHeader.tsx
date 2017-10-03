import * as React from 'react'
import * as Relay from 'react-relay'
import {$p, $v} from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'
import {Viewer, SearchProviderAlgolia} from '../../../types/types'
import PopupWrapper from '../../../components/PopupWrapper/PopupWrapper'
import FloatingInput from '../../../components/FloatingInput/FloatingInput'
import NewToggleButton from '../../../components/NewToggleButton/NewToggleButton'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'

interface Props {
  apiKeyChange: (e: any) => void
  applicationIdChange: (e: any) => void
  isEnabledChange: (e: any) => void
  apiKey: string
  applicationId: string
  isEnabled: boolean
  connected: boolean
  close: Function
}

const Paragraph = styled.p`
  width: 350px;
`

export default class AlgoliaPopupHeader extends React.Component<Props, {}> {
  constructor(props) {
    super(props)
  }

  render() {
    const {isEnabledChange, apiKeyChange, applicationIdChange, apiKey, applicationId, isEnabled, connected, close}
      = this.props

    return (
      <div className={cx($p.bgBlack04, $p.pa38, $p.relative)}>
        <div className={cx($p.absolute, $p.top38, $p.left38)}>
          <NewToggleButton
            defaultChecked={isEnabled}
            onChange={isEnabledChange}
            className={cx($p.mt6)}
          />
        </div>
        <div className={cx($p.flex, $p.flexColumn, $p.itemsCenter, $p.mt16)}>
          <img
            src={require('../../../assets/graphics/algolia-logo.svg')} alt='Algolia'
            className={$p.w30}
          />
          <Paragraph className={cx($p.black50, $p.mt38, $p.tc)}>
            Hosted Search API that delivers instant and relevant results from the first keystroke
          </Paragraph>
          <div
            className={cx(
              $p.ttu,
              $p.br2,
              $p.f14,
              $p.pv4,
              $p.ph10,
              $p.br2,
              $p.pointer,
              $p.mt38,
              {
                [`${$p.green} ${$p.bgGreen20}`]: connected,
                [`${$p.white} ${$p.bgBlue}`]: !connected,
              },
            )}
            onClick={isEnabledChange}
          >
            {connected ? 'Enabled' : 'Enable'}
          </div>
          <style jsx global>{`
            .algolia-popup-x {
              @inherit: .absolute, .right0, .top0, .pointer, .pt38, .pr38;
            }
          `}</style>
          <Icon
            src={require('graphcool-styles/icons/stroke/cross.svg')}
            stroke={true}
            width={25}
            height={25}
            strokeWidth={2}
            className='algolia-popup-x'
            color={$v.gray50}
            onClick={close}
          />
        </div>
        <div className={cx($p.mt38)}>
          <FloatingInput
            labelClassName={cx($p.f16, $p.pa16, $p.black50, $p.fw3)}
            className={cx($p.pa16, $p.br2, $p.bn, $p.mb10, $p.f25, $p.fw3)}
            label='Application Id'
            placeholder='xxxxxxxxxxxxx'
            value={applicationId || ''}
            onChange={applicationIdChange}
          />
          <FloatingInput
            labelClassName={cx($p.f16, $p.pa16, $p.black50, $p.fw3)}
            className={cx($p.pa16, $p.br2, $p.bn, $p.mb10, $p.f25, $p.fw3)}
            label='API Key'
            placeholder='xxxxxxxxxxxxx'
            value={apiKey || ''}
            onChange={apiKeyChange}
          />
          <style jsx>{`
            .info {
              @inherit: .f12, .orange;
            }
          `}</style>
          {(!apiKey || apiKey.length === 0) && (
            <div className='info'>
              Please create a new API Key and <b>do not use the Admin Key</b>.
              The new API Key needs the ACL "Add records" and "Delete records".
            </div>
          )}
        </div>
      </div>
    )
  }
}
