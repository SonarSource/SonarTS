import * as React from 'react'
const ReactModal: any = require('react-modal')

interface Props {
  isOpen: boolean
  contentLabel: string
  onRequestClose: Function
  width?: number
}

export default class Modal extends React.Component<Props, {}> {

  constructor(props) {
    super(props)
  }

  render() {
    // const width = this.props.width || '500px'
    return (
      <ReactModal {...this.props}
        style={{
          overlay: {
            zIndex: 999,
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          content: {
            position: 'relative',
            width: '500px',
            height: 'auto',
            top: 'initial',
            left: 'initial',
            right: 'initial',
            bottom: 'initial',
            borderRadius: 2,
            padding: 0,
            border: 'none',
            background: 'none',
            boxShadow: '0 1px 7px rgba(0,0,0,.2)',
          },
        }}>{this.props.children}</ReactModal>
    )
  }
}
