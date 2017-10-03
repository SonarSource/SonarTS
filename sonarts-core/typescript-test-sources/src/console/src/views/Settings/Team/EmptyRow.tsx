import * as React from 'react'
import * as Relay from 'react-relay'
import {$p} from 'graphcool-styles'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import * as cx from 'classnames'
import InviteCollaboratorMutation from '../../../mutations/AddCollaboratorMutation'
import {ShowNotificationCallback} from '../../../types/utils'
import {showNotification} from '../../../actions/notification'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {onFailureShowNotification} from '../../../utils/relay'

interface State {
  email: string
  isEnteringEmail: boolean
}

interface Props {
  hasAddFunctionality: boolean
  numberOfLeftSeats?: number
  projectId?: string
  showNotification: ShowNotificationCallback
}

class EmptyRow extends React.Component<Props, State> {

  state = {
    email: '',
    isEnteringEmail: false,
  }

  render() {
    let borderColor
    if (this.state.isEnteringEmail) {
      borderColor = 'blueBorder'
    } else if (this.props.hasAddFunctionality) {
      borderColor = $p.bBlack20
    } else {
      borderColor = $p.bBlack10
    }

    return (
      <div className={`container borderStyle ${borderColor}`}>
        <style jsx={true}>{`

          .container {
            @inherit: .flex, .itemsCenter, .ph16, .mb10;
            height: 69px;
          }

          .borderStyle {
            @inherit: .ba, .bDashed, .br2;
          }

          .blueBorder {
            border-color: rgba(42,127,211,1);
          }

        `}</style>
        {this.getRowContent()}
      </div>
    )
  }

  private getRowContent = (): JSX.Element => {
    let rowContent: JSX.Element
    if (this.state.isEnteringEmail) {
      rowContent = (
        <div className='flex justifyBetween w100'>
          <style jsx={true}>{`
          .inputField {
            @inherit: .pl6, .f25, .fw3, .w100, .h100;
            color: rgba(42,127,211,1);
          }

          .iconContainer {
            @inherit: .flex, .itemsCenter;
          }
          `}</style>
          <input
            className='inputField border-box'
            autoFocus={true}
            placeholder='Invite by email address...'
            value={this.state.email}
            onKeyDown={this.handleKeyDown}
            onChange={(e: any) => this.setState({email: e.target.value} as State)}
          />
          <div className='iconContainer'>
            <Icon
              className={cx($p.mh10, $p.pointer)}
              src={require('../../../assets/icons/cross_red.svg')}
              width={15}
              height={15}
              onClick={() =>
                    this.setState({
                      isEnteringEmail: false,
                    } as State)
                  }
            />
            <Icon
              className={cx($p.mh10, $p.pointer)}
              src={require('../../../assets/icons/confirm.svg')}
              width={35}
              height={35}
              onClick={() => this.addCollaborator(this.state.email)}
            />
          </div>
        </div>
      )
    } else if (this.props.hasAddFunctionality) {
      const {numberOfLeftSeats} = this.props
      rowContent = (
        <div
          className='addCollaborator'
          onClick={() => {
                this.setState({
                  isEnteringEmail: true,
                } as State)
              }}
        >
          <style jsx={true}>{`

            .addCollaborator {
              @inherit: .flex, .pointer, .pl6;
            }

            .grayCircle {
              @inherit: .flex, .justifyCenter, .itemsCenter, .br100, .mr16, .hS25, .wS25, .bgBlack07;
            }

          `}</style>
          <div className={'grayCircle'}>
            <Icon
              src={require('../../../assets/icons/addFull.svg')}
              width={12}
              height={12}
              color={'rgba(0,0,0,.3)'}
              stroke={true}
              strokeWidth={8}
            />
          </div>
          <div className='f16 black40'>
            add collaborator (
            {numberOfLeftSeats < 0 ? 'unlimited' : numberOfLeftSeats} {numberOfLeftSeats === 1 ? 'seat ' : 'seats '}
            left)
          </div>
        </div>
      )
    } else {
      rowContent = (
        <div></div>
      )
    }
    return rowContent
  }

  private handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.addCollaborator(this.state.email)
    } else if (e.keyCode === 27) {
      this.setState({
        isEnteringEmail: false,
      } as State)
    }
  }

  private addCollaborator(email: string): void {
    Relay.Store.commitUpdate(
      new InviteCollaboratorMutation({
        projectId: this.props.projectId,
        email: email,
      }),
      {
        onSuccess: () => {
          this.setState({isEnteringEmail: false} as State)
          this.props.showNotification({message: 'Added new collaborator: ' + email, level: 'success'})
        },
        onFailure: (transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
        },
      },
    )
  }

}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({showNotification}, dispatch)
}

const mappedEmptyRow = connect(null, mapDispatchToProps)(EmptyRow)
export default mappedEmptyRow
