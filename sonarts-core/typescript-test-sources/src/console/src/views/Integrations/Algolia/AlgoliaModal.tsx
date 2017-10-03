import * as React from 'react'
import * as Modal from 'react-modal'
import * as Relay from 'react-relay'
import {fieldModalStyle} from '../../../utils/modalStyle'
import {SearchProviderAlgolia} from '../../../types/types'
import UpdateSearchProviderAlgolia from '../../../mutations/UpdateSearchProviderAlgolia'
import FloatingInput from '../../../components/FloatingInput/FloatingInput'
import * as cx from 'classnames'
import {$p, $v, Icon} from 'graphcool-styles'

interface Props {
  apiKey: string
  applicationId: string
  onChangeApiKey: Function
  onChangeApplicationId: Function
  onRequestClose: () => void
  onSave: () => void
}

export default class AlgoliaModal extends React.Component<Props, null> {
  render() {
    const {apiKey, applicationId, onChangeApiKey, onChangeApplicationId, onRequestClose, onSave} = this.props

    return (
      <Modal
        isOpen={true}
        onRequestClose={onRequestClose}
        contentLabel='Algolia Settings'
        style={fieldModalStyle}
      >
        <style jsx={true} global>{`
          .algolia-modal .input {
            background: none;
          }
        `}</style>
        <style jsx={true}>{`
          .algolia-modal {
            @p: .bgWhite;
          }
          .header {
            @p: .pb25;
            background: #EEF7F0;
            border-bottom: 1px solid #D8F0DC;
          }
          .logo {
            @p: .mt25, .ml25;
            width: 75px;
          }

          .close {
            @p: .absolute, .pointer;
            top: 23px;
            right: 24px;
          }
          .button {
            @p: .pointer;
            padding: 9px 16px 10px 16px;
          }
          .save {
            @p: .bgWhite10, .white30, .br2;
          }
          .save.active {
            @p: .bgGreen, .white;
          }
          .inputs {
            @p: .pa25;
          }
          .bottom {
            @p: .flex, .itemsCenter, .justifyBetween, .pa16, .bt, .bBlack10;
          }
          .inputs, .bottom {
            @p: .bgBlack04;
          }
          .cancel {
            @p: .white50, .f16;
          }
          .intro {
            @p: .flex, .justifyCenter, .w100, .h100, .pa38, .itemsStart;
            h1, h2 {
              @p: .tc;
            }
            h1 {
              @p: .f25, .fw3;
            }
            h2 {
              @p: .black40, .f14, .mt25, .fw4;
            }
          }
          .inner-intro {
            @p: .flex, .justifyCenter, .itemsCenter, .flexColumn, .mt16;
          }
          h2 + h2 {
            @p: .mt38;
          }
        `}</style>
        <div className='algolia-modal'>
          <div className='header'>
            <img className='logo' src={require('assets/graphics/algolia-logo.svg')} alt=''/>
            <div
              className='close'
              onClick={onRequestClose}
            >
              <Icon
                src={require('graphcool-styles/icons/stroke/cross.svg')}
                stroke
                strokeWidth={2}
                color={$v.gray40}
                width={26}
                height={26}
              />
            </div>
          </div>
          {(applicationId.length === 0 || apiKey.length === 0) && (
            <div className='intro'>
              <div className='inner-intro'>
                <h1>Getting Started with the Algolia Integration</h1>
                <h2>
                  In this integration, Graphcool automatically syncs your data to Algolia,
                  so you have a lightning fast search on your app's data.
                </h2>
                <h2>
                  In order to use this integration,
                  you have to create an API key in your Algolia Dashboard.
                </h2>
                <a
                  className='button green'
                  href={
                    'https://www.graph.cool/docs/tutorials/algolia-auto-syncing-for-graphql-backends-aroozee9zu' +
                    '#creating-algolia-search-indices'
                  }
                  target='_blank'
                >
                  How to create an API key
                </a>
              </div>
            </div>
          )}
          <div className='inputs'>
            <FloatingInput
              labelClassName={cx($p.f16, $p.pa16, $p.black50, $p.fw3)}
              className={cx($p.pa16, $p.br2, $p.bn, $p.mb10, $p.f25, $p.fw3, 'input')}
              label='Application Id'
              placeholder='xxxxxxxxxxxxx'
              value={applicationId || ''}
              onChange={onChangeApplicationId}
            />
            <FloatingInput
              labelClassName={cx($p.f16, $p.pa16, $p.black50, $p.fw3)}
              className={cx($p.pa16, $p.br2, $p.bn, $p.mb10, $p.f25, $p.fw3, 'input')}
              label='API Key'
              placeholder='xxxxxxxxxxxxx'
              value={apiKey || ''}
              onChange={onChangeApiKey}
            />
          </div>
          <div className='bottom'>
            <div className='button cancel' onClick={onRequestClose}>Cancel</div>
            <div className='button save active' onClick={onSave}>Save</div>
          </div>
        </div>
      </Modal>
    )
  }

}
