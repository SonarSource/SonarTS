import * as React from 'react'
import * as Modal from 'react-modal'
import {fieldModalStyle} from '../utils/modalStyle'
import {Icon, $v} from 'graphcool-styles'

interface Props {
  onRequestClose: () => void
  width?: number
}

export default class Popup extends React.Component<Props, null> {
  render() {
    const modalStyle = {
      overlay: fieldModalStyle.overlay,
      content: {
        ...fieldModalStyle.content,
        width: this.props.width || 560,
      },
    }
    return (
      <Modal
        isOpen
        onRequestClose={this.props.onRequestClose}
        style={modalStyle}
      >
        <style jsx>{`
          .modal {
            @p: .bgWhite;
          }
          .close {
            @p: .absolute, .pointer, .pa10;
            top: -25px;
            right: -25px;
            transform: translate(100%,-100%);
          }
        `}</style>
        <div className='modal'>
          {this.props.children}
        </div>
        <div className='close' onClick={this.props.onRequestClose}>
          <Icon
            src={require('graphcool-styles/icons/stroke/cross.svg')}
            stroke
            strokeWidth={2}
            color={$v.gray40}
            width={26}
            height={26}
          />
        </div>
      </Modal>
    )
  }
}
