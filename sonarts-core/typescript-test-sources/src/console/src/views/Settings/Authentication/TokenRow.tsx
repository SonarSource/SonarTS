import * as React from 'react'
import {PermanentAuthToken} from '../../../types/types'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import CopyToClipboard from 'react-copy-to-clipboard'

interface Props {
  permanentAuthToken: PermanentAuthToken
  deleteSystemToken: (PermanentAuthToken) => void
}

interface State {
  copied: boolean
  isHovered: boolean
}

export default class TokenRow extends React.Component<Props, State> {

  copyTimer: number

  state = {
    copied: false,
    isHovered: false,
  }

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div
        className='container'
        onMouseEnter={() => this.setState({isHovered: true} as State)}
        onMouseLeave={() => this.setState({isHovered: false} as State)}
      >
        <style jsx={true}>{`

          .container {
            @inherit: .bb, .pb25, .mb25, .ph25;
            border-color: rgba( 229, 229, 229, 1);
          }

          .headerRow {
            @inherit: .flex, .itemsCenter;
          }

          .title {
            @inherit: .f14, .black40, .mh6;
          }

          .tokenRow {
            @inherit: .f25, .fw3, .mt10, .overflowXHidden, .nowrap;
          }

          @keyframes movingCopyIndicator {
            0% {
              opacity: 0;
              transform: translate(-50%, 0);
            }

            50% {
              opacity: 1;
            }

            100% {
              opacity: 0;
              transform: translate(-50%, -50px);
            }
          }

          .copyIndicator {
            top: -30px;
            left: 96.5%;
            transform: translate(-50%,0);
            animation: movingCopyIndicator .7s linear;
          }

        `}</style>
        <div className='headerRow'>
          <Icon
            src={require('../../../assets/icons/lock.svg')}
            width={14}
            height={20}
          />
          <div className='title'>{this.props.permanentAuthToken.name}</div>
          <Icon
            className='pointer'
            src={require('../../../assets/icons/trash.svg')}
            width={16}
            height={17}
            onClick={() => this.props.deleteSystemToken(this.props.permanentAuthToken)}
          />
        </div>
        <CopyToClipboard
          text={this.props.permanentAuthToken.token}
          onCopy={this.onCopy}
        >
          <div className='flex itemsCenter pointer relative'>
            <div className='f25 fw3 mt10 overflowXHidden nowrap'>
              {this.props.permanentAuthToken.token}
            </div>

            {this.state.copied &&
            <div
              className='copyIndicator absolute f14 fw6 blue'
            >
              Copied
            </div>
            }
            {this.state.isHovered &&
            <Icon
              className='ml10 buttonShadow'
              color='rgba(0,0,0,.5)'
              src={require('../../../assets/icons/copy.svg')}
              width={34}
              height={34}
            />
            }
          </div>
        </CopyToClipboard>
      </div>
    )
  }

  private onCopy: () => any = () => {
    this.setState({copied: true} as State)
    this.copyTimer = window.setTimeout(
      () => this.setState({copied: false, isHovered: false} as State),
      1000,
    )
  }

}
