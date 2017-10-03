import * as React from 'react'
import * as Relay from 'react-relay'
import ResetPasswordMutation from '../../../mutations/ResetPasswordMutation'
import {Icon} from 'graphcool-styles'
import Loading from '../../../components/Loading/Loading'
import { getQueryVariable } from '../../../utils/location'
import * as cookiestore from 'cookiestore'
import { updateNetworkLayer } from '../../../utils/relay'
import {ConsoleEvents} from 'graphcool-metrics'
import tracker from '../../../utils/metrics'
const classes: any = require('./ResetPasswordView.scss')

interface State {
  newPassword: string
  loading: boolean
}

export default class ResetPasswordView extends React.Component<{}, State> {

  state = {
    newPassword: '',
    loading: false,
  }

  _submit () {
    this.setState({ loading: true } as State)

    const resetPasswordToken = getQueryVariable('token')
    const { newPassword } = this.state

    Relay.Store.commitUpdate(
      new ResetPasswordMutation({
        resetPasswordToken,
        newPassword,
      }),
      {
        onSuccess: (response) => {
          cookiestore.set('graphcool_auth_token', response.resetPassword.token)
          cookiestore.set('graphcool_customer_id', response.resetPassword.user.id)
          updateNetworkLayer()

          tracker.track(ConsoleEvents.passwordReset())
        },
        onFailure: (transaction) => {
          alert(transaction.getError())

          this.setState({ loading: false } as State)
        },
      },
    )
  }

  render () {
    if (this.state.loading) {
      return (
        <div className={classes.root}>
          <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Loading color='#fff' />
          </div>
        </div>
      )
    }

    return (
      <div className={classes.root}>
        <div className={classes.box}>
          <div className={classes.logo}>
            <Icon
              width={60} height={70}
              src={require('assets/icons/logo.svg')}
              color='#fff'
              />
          </div>
          <div className={classes.instruction}>
            Please choose your password. <br />
            You will be logged in afterwards.
          </div>
          <div className={classes.form}>
            <input
              type='password'
              placeholder='Password'
              onChange={(e) => this.setState({ newPassword: (e.target as HTMLInputElement).value } as State)}
              onKeyUp={(e) => e.keyCode === 13 ? this._submit() : null}
              />
            <button onClick={() => this._submit()}>Set Password</button>
          </div>
        </div>
      </div>
    )
  }
}
