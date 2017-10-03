import * as React from 'react'
import * as Modal from 'react-modal'
import {fieldModalStyle} from '../../utils/modalStyle'

interface State {
  isOpen: boolean
  isConfirm: boolean
  text: string
  title: string
}

const modalStyling = {
  overlay: {
    ...fieldModalStyle.overlay,
    zIndex: 999,
  },
  content: {
    ...fieldModalStyle.content,
    width: 450,
  },
}

export default class Alert extends React.Component<null, State> {
  reject: () => void
  resolve: () => void
  constructor() {
    super()
    this.state = {
      isOpen: false,
      isConfirm: false,
      text: '',
      title: '',
    }
    global['graphcoolAlert'] = this.showAlert
    global['graphcoolConfirm'] = this.showConfirm
  }

  showAlert = (text: string) => {
    this.setState({isOpen: true, text} as State)
  }

  showConfirm = (text: string, title?: string) => {
    return new Promise((resolve, reject) => {
      this.setState({isOpen: true, isConfirm: true, text, title: title || ''})
      this.resolve = resolve
      this.reject = reject
    })
  }

  render() {
    const {isOpen, text, title} = this.state
    return (
      <Modal
        isOpen={isOpen}
        contentLabel='Alert'
        style={modalStyling}
        onRequestClose={this.close}
      >
        <style jsx>{`
          .alert {
            @p: .buttonShadow
          }
          .text {
            @p: .bgWhite, .pa38, .black50, .tc;
          }
          .footer {
            @p: .pa25, .flex, .justifyBetween, .itemsCenter, .bt, .bBlack10;
            background: rgb(250,250,250);
          }
          .button {
            @p: .br2, .pointer;
            padding: 9px 16px 10px 16px;
          }
          .warning {
            @p: .white, .bgLightOrange;
          }
          .cancel {
            @p: .black50;
          }
          .green {
            @p: .white, .bgGreen;
          }
          .title {
            @p: .f25, .fw3, .tc, .pb25, .black;
            line-height: 2;
          }
        `}</style>
        <div className='alert'>
          <div className='text'>
            <div className='title'>
              {title && title.length > 0 ? title : 'Are you sure?'}
            </div>
            <div>
              {text}
            </div>
            <div>
              Do you really want to continue?
            </div>
          </div>
          <div className='footer'>
            <div>
              {this.state.isConfirm && (
                <div className='button cancel' onClick={this.cancel}>Cancel</div>
              )}
            </div>
            <div className='button warning' onClick={this.confirm}>Continue anyway</div>
          </div>
        </div>
      </Modal>
    )
  }

  private cancel = () => {
    this.close()
    if (this.state.isConfirm && typeof this.reject === 'function') {
      this.reject()
    }
  }

  private confirm = () => {
    this.close()
    if (this.state.isConfirm && typeof this.resolve === 'function') {
      this.resolve()
    }
  }

  private close = () => {
    this.setState({isOpen: false} as State)
  }
}
