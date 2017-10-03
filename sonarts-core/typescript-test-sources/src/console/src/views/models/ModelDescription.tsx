import * as React from 'react'
import * as Relay from 'react-relay'
import Loading from '../../components/Loading/Loading'
import { onFailureShowNotification } from '../../utils/relay'
import UpdateModelDescriptionMutation from '../../mutations/UpdateModelDescriptionMutation'
import { Model } from '../../types/types'
import { ShowNotificationCallback } from '../../types/utils'
import {connect} from 'react-redux'
import {showNotification} from '../../actions/notification'
import {bindActionCreators} from 'redux'
import tracker from '../../utils/metrics'
const classes: any = require('./ModelDescription.scss')
import {ConsoleEvents} from 'graphcool-metrics'

interface Props {
  model: Model
  showNotification: ShowNotificationCallback
}

interface State {
  editDescription: boolean
  editDescriptionPending: boolean
}

class ModelDescription extends React.Component<Props, State> {

  state = {
    editDescription: false,
    editDescriptionPending: false,
  }

  render () {
    if (this.state.editDescriptionPending) {
      return (
        <Loading color='#B9B9C8' />
      )
    }

    if (this.state.editDescription) {
      return (
        <input
          autoFocus
          type='text'
          placeholder='Description'
          defaultValue={this.props.model.description}
          onFocus={() => {
            tracker.track(ConsoleEvents.Schema.Model.Description.focused())
          }}
          onBlur={this.saveDescription}
          onKeyDown={(e: any) => e.keyCode === 13 ? e.target.blur() : null}
        />
      )
    }

    return (
      <span
        className={classes.descriptionText}
        onClick={() => this.setState({ editDescription: true } as State)}
      >
        {this.props.model.description || 'Add description'}
      </span>
    )
  }

  private saveDescription = (e: any) => {
    const description = e.target.value
    if (this.props.model.description === description) {
      this.setState({ editDescription: false } as State)
      tracker.track(ConsoleEvents.Schema.Model.Description.blurred({type: 'Cancel'}))
      return
    }

    this.setState({ editDescriptionPending: true } as State)
    tracker.track(ConsoleEvents.Schema.Model.Description.blurred({type: 'Save'}))

    Relay.Store.commitUpdate(
      new UpdateModelDescriptionMutation({
        modelId: this.props.model.id,
        description,
      }),
      {
        onSuccess: () => {
          this.setState({
            editDescription: false,
            editDescriptionPending: false,
          })
        },
        onFailure: (transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
          this.setState({
            editDescription: false,
            editDescriptionPending: false,
          })
        },
      },
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({showNotification}, dispatch)
}

const MappedModelDescription = connect(null, mapDispatchToProps)(ModelDescription)

export default Relay.createContainer(MappedModelDescription, {
  fragments: {
    model: () => Relay.QL`
      fragment on Model {
        id
        description
      }
    `,
  },
})
