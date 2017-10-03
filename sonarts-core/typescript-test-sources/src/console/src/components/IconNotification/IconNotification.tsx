import * as React from 'react'
import TemporaryNotification from '../TemporaryNotification/TemporaryNotification'
import {Icon} from 'graphcool-styles'

interface Props {
  id: string
}

export default class IconNotification extends React.Component<Props, {}> {

  render() {
    return (
      <TemporaryNotification id={this.props.id}>
        <div
          className='flex br-2 items-center justify-center bg-white shadow-2'
          style={{
            width: 88,
            height: 88,
            pointerEvents: 'none',
          }}
        >
          <Icon width={30} height={30} color='#00B861' src={require('../../assets/icons/check.svg')} />
        </div>
      </TemporaryNotification>
    )
  }
}
