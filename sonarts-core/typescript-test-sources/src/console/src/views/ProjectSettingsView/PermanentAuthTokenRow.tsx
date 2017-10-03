import * as React from 'react'
import * as Relay from 'react-relay'
import {PermanentAuthToken} from '../../types/types'
import {Icon} from 'graphcool-styles'
import DeletePermanentAuthTokenMutation from '../../mutations/DeletePermanentAuthTokenMutation'
import {ShowNotificationCallback} from '../../types/utils'
import {connect} from 'react-redux'
import {showNotification} from '../../actions/notification'
import {bindActionCreators} from 'redux'
import CopyToClipboard from 'react-copy-to-clipboard'
import {onFailureShowNotification} from '../../utils/relay'

const classes = require('./PermanentAuthTokenRow.scss')

interface Props {
  permanentAuthToken: PermanentAuthToken
  projectId: string
  showNotification: ShowNotificationCallback
}

interface State {
  showFullToken: boolean
  isCopied: boolean
}

class PermanentAuthTokenRow extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      showFullToken: false,
      isCopied: false,
    }
  }

  render() {

    return (
      <CopyToClipboard
        text={this.props.permanentAuthToken.token}
        onCopy={() => this.setState({isCopied: true} as State)}
      >
        <div
          className={classes.root}
          onMouseEnter={() => this.setState({showFullToken: true} as State)}
          onMouseLeave={() => this.setState({showFullToken: false} as State)}
        >
          <div className={classes.content}>
            <div className={classes.name}>
              {this.props.permanentAuthToken.name}
              {this.state.showFullToken &&
                <span className={classes.hint}>
                  {this.state.isCopied ? '(copied)' : '(click to copy)'}
                </span>
              }
            </div>
            <div className={classes.token}>
              {this.state.showFullToken ? this.props.permanentAuthToken.token : this.getTokenSuffix()}
            </div>
          </div>
          <Icon
            width={19}
            height={19}
            src={require('assets/icons/delete.svg')}
            onClick={this.deleteSystemToken}
          />
        </div>
      </CopyToClipboard>
    )
  }

  private getTokenSuffix = (): string => {
    // Getting the suffix because that's the only part that's changing
    return this.props.permanentAuthToken.token.split('.').reverse()[0]
  }

  private deleteSystemToken = (): void => {
    Relay.Store.commitUpdate(
      new DeletePermanentAuthTokenMutation({
        projectId: this.props.projectId,
        tokenId: this.props.permanentAuthToken.id,
      }),
      {
        onFailure: (transaction) => onFailureShowNotification(transaction, this.props.showNotification),
      })
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({showNotification}, dispatch)
}

const MappedPermanentAuthTokenRow = connect(null, mapDispatchToProps)(PermanentAuthTokenRow)

export default Relay.createContainer(MappedPermanentAuthTokenRow, {
  fragments: {
    permanentAuthToken: () => Relay.QL`
      fragment on PermanentAuthToken {
        id
        name
        token
      }
    `,
  },
})
