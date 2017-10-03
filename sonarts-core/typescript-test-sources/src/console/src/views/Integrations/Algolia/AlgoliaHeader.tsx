import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import {Link} from 'react-router'

interface Props {
  onAddIndex: () => void
  onOpenModal: () => void
  params: any
}

const AlgoliaHeader = ({onAddIndex, onOpenModal, params}: Props) => {
  return (
    <div className='algolia-header'>
      <style jsx={true}>{`
        .algolia-header {
          @p: .pa25, .bgBlack02, .flex, .justifyBetween, .itemsCenter, .bb, .bBlack10;
        }
        .algolia-logo {
          @p: .ml25;
          width: 112px;
        }
        .right, .left {
          @p: .flex, .itemsCenter;
        }
        .change {
          @p: .f14, .black30, .ttu, .fw6, .nowrap, .pointer;
        }
        .button {
          @p: .ml25, .buttonShadow, .bgWhite, .black50, .ttu, .f14, .nowrap, .pointer;
          padding: 7px 9px;
        }
      `}</style>

      <div className='left'>
        <Link to={`/${params.projectName}/integrations`}>
          <Icon
            src={require('assets/icons/gray_arrow_left.svg')}
            width={22}
            height={22}
          />
        </Link>
        <img src={require('assets/graphics/algolia-logo.svg')} className='algolia-logo' />
      </div>
      <div className='right'>
        <div className='change' onClick={onOpenModal}>
          Change Credentials
        </div>
        <div className='button' onClick={onAddIndex}>
          + Add Index
        </div>
      </div>
    </div>
  )
}

export default AlgoliaHeader
