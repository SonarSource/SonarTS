import * as React from 'react'
import {Project} from '../../../types/types'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import AddPermanentAuthTokenMutation from '../../../mutations/AddPermanentAuthTokenMutation'
import * as Relay from 'react-relay'
import TokenRow from './TokenRow'
import DeletePermanentAuthTokenMutation from '../../../mutations/DeletePermanentAuthTokenMutation'
import {ShowNotificationCallback} from '../../../types/utils'
import {onFailureShowNotification} from '../../../utils/relay'
import {connect} from 'react-redux'
import {showNotification} from '../../../actions/notification'
import {bindActionCreators} from 'redux'

interface State {
  isEnteringTokenName: boolean
  newTokenName: string
}

interface Props {
  project: Project
  showNotification: ShowNotificationCallback
}

class Tokens extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      isEnteringTokenName: false,
      newTokenName: '',
    }
  }

  render() {

    const tokens = this.props.project.permanentAuthTokens.edges.map(edge => edge.node)

    return (
      <div className='pt25'>
        <style jsx={true}>{`

          .blueCircle {
            @inherit: .flex, .justifyCenter, .itemsCenter, .br100, .mr16, .hS25, .wS25;
            background-color: rgba(42,127,211,.2);
          }

          .grayCircle {
            @inherit: .flex, .justifyCenter, .itemsCenter, .br100, .mr16, .hS25, .wS25, .bgBlack07;
          }

          .addTokenTextBlue {
            @inherit: .f16, .o50;
            color: rgba(42,127,211,1);
          }

          .addTokenTextGray {
            @inherit: .f16, .black30;
          }

          .inputField {
            @inherit: .f25, .fw3, .w100;
            color: rgba(42,127,211,1);
          }

        `}</style>
        {tokens.map((token) => (
          <TokenRow
            key={token.token}
            permanentAuthToken={token}
            deleteSystemToken={this.deleteSystemToken}
          />
        ))}
        {this.state.isEnteringTokenName ?
          (
            <div className='flex pl25'>
              <input
                className='inputField'
                autoFocus={true}
                placeholder='Define a name for the token ...'
                value={this.state.newTokenName}
                onKeyDown={this.handleKeyDown}
                onChange={(e: any) => this.setState({newTokenName: e.target.value} as State)}
              />
              <div className='flex itemsCenter'>
                <Icon
                  className='mh10 pointer'
                  src={require('../../../assets/icons/cross_red.svg')}
                  width={15}
                  height={15}
                  onClick={() =>
                    this.setState({
                      isEnteringTokenName: false,
                    } as State)
                  }
                />
                <Icon
                  className='mh10 pointer'
                  src={require('../../../assets/icons/confirm.svg')}
                  width={35}
                  height={35}
                  onClick={this.addPermanentAuthToken}
                />
              </div>
            </div>
          ) :
          (
            <div
              className='flex pointer pl25'
              onClick={() => {
                this.setState({
                  isEnteringTokenName: true,
                } as State)
              }}
            >
              <div className={tokens.length > 0 ? 'grayCircle' : 'blueCircle'}>
                <Icon
                  src={require('../../../assets/icons/addFull.svg')}
                  width={12}
                  height={12}
                  color={tokens.length > 0 ? 'rgba(0,0,0,.3)' : 'rgba(42,127,211,1)'}
                  stroke={true}
                  strokeWidth={8}
                />
              </div>
              <div className={tokens.length > 0 ? 'addTokenTextGray' : 'addTokenTextBlue'}>
                add permanent access token
              </div>
            </div>
          )
        }
      </div>
    )
  }

  private handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.addPermanentAuthToken()
    } else if (e.keyCode === 27) {
      this.setState({
        isEnteringTokenName: false,
      } as State)
    }
  }

  private addPermanentAuthToken = (): void => {
    if (!this.state.newTokenName) {
      return
    }
    Relay.Store.commitUpdate(
      new AddPermanentAuthTokenMutation({
        projectId: this.props.project.id,
        tokenName: this.state.newTokenName,
      }),
      {
        onSuccess: () => {
          this.setState({
            newTokenName: '',
            isEnteringTokenName: false} as State)
        },
        onFailure: (transaction) => console.error('could not submit token, an error occured'),
      },
    )
  }

  private deleteSystemToken = (token): void => {
    graphcoolConfirm(`This will delete token \'${token.name}\'`)
      .then(() => {
        Relay.Store.commitUpdate(
          new DeletePermanentAuthTokenMutation({
            projectId: this.props.project.id,
            tokenId: token.id,
          }),
          {
            onFailure: (transaction) => onFailureShowNotification(transaction, this.props.showNotification),
          })
    })
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({showNotification}, dispatch)
}

const mappedTokens = connect(null, mapDispatchToProps)(Tokens)

export default Relay.createContainer(mappedTokens, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id
        permanentAuthTokens (first: 1000) {
          edges {
            node {
              id
              name
              token
            }
          }
        }
      }
    `,
  },
})
