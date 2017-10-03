import * as React from 'react'
import * as Relay from 'react-relay'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {Viewer} from '../../../types/types'
import UpdateCustomerInformationMutation from '../../../mutations/UpdateCustomerInformationMutation'
import UpdatePasswordMutation from '../../../mutations/UpdatePasswordMutation'
import {onFailureShowNotification} from '../../../utils/relay'
import {ShowNotificationCallback} from '../../../types/utils'
import {showNotification} from '../../../actions/notification'
const classes: any = require('./SettingsTab.scss')

interface Props {
  params: any
  viewer: Viewer
  showNotification: ShowNotificationCallback
}

interface State {
  email: string
  name: string
  oldPassword: string
  newPasswordOne: string
  newPasswordTwo: string
  showPassword: boolean
}

class SettingsTab extends React.Component<Props, State> {

  constructor (props) {
    super(props)

    const authProvider = window.localStorage.getItem('graphcool_auth_provider')

    this.state = {
      email: this.props.viewer.user.crm.information.email,
      name: this.props.viewer.user.crm.information.name,
      oldPassword: '',
      newPasswordOne: '',
      newPasswordTwo: '',
      showPassword: authProvider && authProvider.includes('auth0'),
    }
  }

  render () {
    const {showPassword} = this.state
    return (
      <div className={classes.root}>
        <div className={classes.category}>
          <div className={classes.title}>
            Name
          </div>
          <input
            type='text'
            placeholder='Your name'
            value={this.state.name}
            className={classes.field}
            onChange={(e: any) => this.setState({ name: e.target.value } as State)}
          />
        </div>
        <div className={classes.saveChanges} onClick={this.saveChanges}>
          Save changes
        </div>
      </div>
    )
  }

  private saveChanges = () => {
    const nameWasChanged = this.props.viewer.user.crm.information.name !== this.state.name
    const emailWasChanged = this.props.viewer.user.crm.information.email !== this.state.email
    const passwordWasChanged = this.state.newPasswordOne !== '' && this.state.newPasswordTwo !== ''

    if (!nameWasChanged && !emailWasChanged && !passwordWasChanged) {
      this.props.showNotification({message: 'No changes to save...', level: 'info'})
    }

    if (nameWasChanged || emailWasChanged) {
      this.handleCustomerChange()
    }

    if (passwordWasChanged) {
      this.handlePasswordChange()
    }
  }

  private handleCustomerChange () {
    Relay.Store.commitUpdate(
      new UpdateCustomerInformationMutation({
        customerInformationId: this.props.viewer.user.crm.information.id,
        email: this.state.email,
        name: this.state.name,
      }),
      {
        onSuccess: () => {
          this.props.showNotification({message: 'Changes to email and name were saved.', level: 'success'})
        },
        onFailure: (transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
        },
      },
    )
  }

  private handlePasswordChange () {
    if (this.state.newPasswordOne !== '' && this.state.newPasswordOne === this.state.newPasswordTwo) {
      Relay.Store.commitUpdate(
        new UpdatePasswordMutation({
          customerId: this.props.viewer.user.id,
          oldPassword: this.state.oldPassword,
          newPassword: this.state.newPasswordOne,
        }),
        {
          onSuccess: () => {
            this.props.showNotification({message: 'Changes to password successful.', level: 'success'})
            this.setState({
              oldPassword: '',
              newPasswordOne: '',
              newPasswordTwo: '',
            } as State)
          },
          onFailure: (transaction) => {
            onFailureShowNotification(transaction, this.props.showNotification)
          },
        },
      )
    } else {
      this.props.showNotification({message: 'Please enter the same new password twice.', level: 'error'})
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({showNotification}, dispatch)
}

const MappedSettingsTab = connect(null, mapDispatchToProps)(SettingsTab)

export default Relay.createContainer(MappedSettingsTab, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        user {
          id
          crm {
            information {
              id
              name
              email
            }
          }
        }
      }
    `,
  },
})
