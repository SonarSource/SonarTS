import * as React from 'react'
import Modal from '../../components/Modal'
import * as Relay from 'react-relay'
import {Model} from '../../types/types'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import {$v} from 'graphcool-styles'

interface Props {
  isOpen: boolean
  contentLabel: string
  onRequestClose: Function
  model: Model
  type: Type
}

export type Type = 'ADD' | 'EDIT'

interface State {
  modelName: string
  modelDescription: string
}

class EditModelModal extends React.Component<Props, {}> {

  constructor(props) {
    super(props)

    this.state = {
      modelName: this.props.type === 'ADD' ? '' : props.model.name,
      modelDescription: this.props.type === 'ADD' ? '' : props.model.description,
    }
  }

  render() {
    return (
      <Modal {...this.props}>
        <style jsx={true}>{`
          .modalHeader {
            @inherit: .bgWhite;
          }

          .closeSection {
            @inherit: .flex, .justifyEnd;
          }

        `}</style>
        <div className='modalHeader'>
          <div className='closeSection'>
            <Icon
              src={require('assets/icons/close_modal.svg')}
              width={25}
              height={26}
              color={$v.gray40}
            />
          Settings for {this.props.model.name}
          </div>
        </div>
      </Modal>
    )
  }
}

export default Relay.createContainer(EditModelModal, {
  fragments: {
    model: () => Relay.QL`
      
      fragment on Model {
        id
        name
      }
    `,
  },
})
