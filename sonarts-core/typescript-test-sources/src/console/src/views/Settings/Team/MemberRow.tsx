import * as React from 'react'
import {Seat} from '../../../types/types'
import {Icon} from 'graphcool-styles'

interface State {
  isHovering: boolean
}

interface Props {
  seat: Seat
  onDelete: Function
}

export default class MemberRow extends React.Component<Props, State> {

  colors = ['blueCircle', 'violetCircle', 'orangeCircle', 'redCircle', 'greenCircle']

  constructor(props) {
    super(props)
    this.state = {
      isHovering: false,
    }
  }

  render() {
    return (
      <div
        className={`container ${this.state.isHovering && 'bgBlack02 br2'}`}
        onMouseEnter={() => {
          this.setState({isHovering: true})
        }}
        onMouseLeave={() => {
          this.setState({isHovering: false})
        }}
      >
        <style jsx={true}>{`

                .container {
                  @inherit: .flex, .itemsCenter, .ph16, .mb16;
                  height: 69px;
                }

                .blueCircle {
                  color: rgba(49,177,180,1);
                  background-color: rgba(49,177,180,.2);
                }

                .violetCircle {
                  color: rgba(164,3,111,1);
                  background-color: rgba(164,3,111,.2);
                }

                .orangeCircle {
                  color: rgba(241,143,1,1);
                  background-color: rgba(241,143,1,.2);
                }

                .redCircle {
                  color: rgba(242,92,84,1);
                  background-color: rgba(242,92,84,.2);
                }

                .greenCircle {
                  color: rgba(42,189,60,1);
                  background-color: rgba(42,189,60,.2);
                }

                .seatIndicator {
                  @p: .flex, .justifyCenter, .itemsCenter, .br100, .wS38, .hS38, .fw6, .f20;
                }

                .move {
                  transition: .15s linear all;
                }

              `}</style>
        <div className={`flex justifyBetween itemsCenter w100 ph10`}>
          <div className='flex'>
            <div className={`seatIndicator ${this.randomColor()}`}>
              {this.props.seat.name.charAt(0)}
            </div>
            <div className='pl16 black80 f25 fw3'>{this.props.seat.name}</div>
            {this.isCurrentUser() && <div className='pl2 black50 f25 fw3'>(you)</div>}
          </div>
          {this.getRightPart()}
        </div>
      </div>
    )
  }

  private getRightPart = (): JSX.Element => {
    if (this.props.seat.isOwner) {
      return (
        <div className='f14 fw6 ttu itemsStart green bgLightgreen20 br2 pv2 ph6'>Owner</div>
      )
    } else if (!this.props.seat.isOwner && this.state.isHovering) {
      return (
        <div
          className='pointer'
          onClick={() => this.props.onDelete(this.props.seat)}
        >
          <Icon
            src={require('../../../assets/icons/trash.svg')}
            width={18}
            height={19}
          />
        </div>
      )
    }
  }

  private randomColor(): string {
    // const random = Math.floor((Math.random() * 4) + 1)
    return this.colors[4]
  }

  private isCurrentUser(): boolean {
    return false
  }

}
