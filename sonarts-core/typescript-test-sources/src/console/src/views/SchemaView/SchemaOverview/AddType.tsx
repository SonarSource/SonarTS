import * as React from 'react'
import FieldItem from './FieldItem'
import {Field, Project, Model} from '../../../types/types'
import * as Relay from 'react-relay'
import {connect} from 'react-redux'
import {showDonePopup, nextStep} from '../../../actions/gettingStarted'
import {showNotification} from '../../../actions/notification'
import {ShowNotificationCallback} from '../../../types/utils'
import {GettingStartedState} from '../../../types/gettingStarted'
import {validateModelName} from '../../../utils/nameValidator'
import {onFailureShowNotification} from '../../../utils/relay'
import tracker from '../../../utils/metrics'
import AddModelMutation from '../../../mutations/AddModelMutation'
import {ConsoleEvents} from 'graphcool-metrics'
import UpdateModelNameMutation from '../../../mutations/UpdateModelNameMutation'
import Loading from '../../../components/Loading/Loading'
import Tether from '../../../components/Tether/Tether'
import {withRouter} from 'react-router'
import {idToBeginning} from '../../../utils/utils'
import UpdateModelMutation from '../../../mutations/UpdateModelMutation'
import ConfirmModel from './ConfirmModel'
import DeleteModelMutation from '../../../mutations/DeleteModelMutation'

interface State {
  modelName: string
  description?: string
  showError: boolean
  editing: boolean
  loading: boolean
  editingDescription: boolean
  showDeletePopup: boolean
}

interface Props {
  onRequestClose?: () => void
  projectId: string
  model: Model
  router: ReactRouter.InjectedRouter
  // injected by redux
  showNotification: ShowNotificationCallback
  showDonePopup: () => void
  nextStep: () => Promise<any>
  gettingStartedState: GettingStartedState

}

const idField = {
  'id': 'dummy',
  'name': 'id',
  'typeIdentifier': 'GraphQLID',
  'isList': false,
  'isRequired': true,
  'isSystem': true,
  'isUnique': true,
  'isReadonly': true,
  'relation': null,
  'relatedModel': null,
}

class AddType extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      // model
      modelName: props.model && props.model.name || '',
      description: props.model && props.model.description || '',
      // ui state
      showError: false,
      editing: Boolean(props.model),
      loading: false,
      editingDescription: false,
      showDeletePopup: false,
    }
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleEsc)
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleEsc)
  }
  render() {
    const {showError, editing, loading, editingDescription, description, showDeletePopup} = this.state
    const {model} = this.props
    let fields
    let permissions
    if (model) {
      fields = model.fields.edges.map(edge => edge.node).sort(idToBeginning)
      permissions = model.permissions.edges.map(edge => edge.node)
    }

    const breaking = Boolean(model) && model.itemCount > 0 && this.state.modelName !== this.props.model.name

    return (
      <div className={'add-type' + (Boolean(model) ? ' editing' : '')}>
        <style jsx>{`
          .add-type {
            @p: .mt16, .ml16, .mr16, .bgWhite, .br2, .relative;
            box-shadow: 0 1px 10px $gray30;
          }
          .add-type.editing {
            @p: .mh0, .mb16;
          }
          .header {
            @p: .pv16, .flex, .itemsCenter, .bb, .bBlack10, .nowrap;
          }
          .badge {
            @p: .bgGreen, .white, .relative, .f12, .fw6, .ttu, .top0, .br2, .selfStart;
            padding: 2px 4px;
            left: -4px;
          }
          .badge.update {
            @p: .bgBlue;
          }
          .input-wrapper {
            @p: .w100, .ml10;
          }
          .name-input {
            @p: .blue, .f20, .fw6;
            width: calc(100% - 20px);
            line-height: 1.3;
            letter-spacing: 0.53px;
          }
          .description-input {
            @p: .f16, .db, .mt16;
            line-height: 1.3;
            margin-left: 1px;
          }
          .fields {
            @p: .w100;
          }
          .footer {
            @p: .flex, .justifyBetween, .bgBlack04, .pa16, .bt, .bBlack10, .relative;
          }
          .button {
            @p: .f14, .pointer, .br2;
            padding: 2px 9px 3px 9px;
          }
          .button.save {
            @p: .bgGreen, .white;
          }
          .button.cancel {
            @p: .black60;
          }
          .button.delete {
            @p: .red;
          }
          .error {
            @p: .orange, .f14, .ml10;
          }
          .loading {
            @p: .z2, .absolute, .top0, .left0, .bottom0, .right0, .bgWhite70, .flex, .itemsCenter, .justifyCenter;
          }
          .underline {
            @p: .underline;
          }
          .edit-description {
            @p: .pointer, .mt16;
          }
          .description-wrapper {
            height: 24px;
          }
          .flexy {
            @p: .flex, .itemsCenter;
          }
        `}</style>
        <div className='header'>
          {editing ? (
            <div className='badge update'>Update Type</div>
          ) : (
            <div className='badge'>New Type</div>
          )}
          <div className='input-wrapper'>
            <input
              type='text'
              className='name-input'
              placeholder='Choose a name...'
              autoFocus
              value={this.state.modelName}
              onChange={this.onModelNameChange}
              onKeyDown={this.handleKeyDown}
            />
            {showError && (
              <div className='error'>
                Models must begin with an uppercase letter and only contain letters and numbers
              </div>
            )}
            <div className='description-wrapper'>
              {(editingDescription || (this.state.description && this.state.description.length > 0)) ? (
                <input
                  type='text'
                  className='description-input'
                  placeholder='Choose a description...'
                  autoFocus={!editing}
                  value={this.state.description}
                  onChange={this.onDescriptionChange}
                  onKeyDown={this.handleDescriptionKeyDown}
                />
              ) : (
                <div className='edit-description' onClick={this.editDescription}>
                  <div className='f16 black40'>
                    <span className='underline'>add description</span>
                    <span className='black30'> (optional)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='fields'>
          {model ? (
            fields.map((field, index) => (
              <FieldItem
                key={field.id}
                field={field}
                permissions={permissions}
                hideBorder={index === 0}
              />
            ))
          ) : (
            <FieldItem
              key={idField.id}
              field={idField as Field}
              permissions={[]}
              hideBorder={true}
              create
            />
          )}
        </div>
        <div className='footer'>
          {editing ? (
            showDeletePopup ? (
              <ConfirmModel
                delete
                onConfirmDeletion={this.delete}
                onCancel={this.hideDeletePopup}
                initialModelName={this.props.model.name}
                mutatedModelName={this.state.modelName}
              />
            ) : (
              <div className='button delete' onClick={this.showDeletePopup}>Delete</div>
            )
          ) : (
            <div className='button cancel' onClick={this.close}>Cancel</div>
          )}
          <div className='flexy'>
            {editing && (
              <div className='button cancel mr16' onClick={this.close}>Cancel</div>
            )}
            {breaking ? (
              <ConfirmModel
                onConfirmBreakingChanges={this.save}
                onResetBreakingChanges={this.reset}
                initialModelName={this.props.model.name}
                mutatedModelName={this.state.modelName}
              />
            ) : (
              <Tether
                style={{
                  pointerEvents: 'none',
                }}
                steps={[{
                  step: 'STEP1_CREATE_POST_MODEL',
                  title: `Save the "Post" Type`,
                }]}
                offsetX={15}
                offsetY={5}
                width={300}
                horizontal='right'
                key='STEP1_CREATE_POST_MODEL'
              >
                <div className='button save' onClick={this.save}>Save</div>
              </Tether>
            )}
          </div>
        </div>
        {loading && (
          <div className='loading'>
            <Loading />
          </div>
        )}
      </div>
    )
  }

  private handleEsc = e => {
    if (e.keyCode === 27) {
      this.close()
    }
  }

  private showDeletePopup = () => {
    this.setState({showDeletePopup: true} as State)
  }

  private hideDeletePopup = () => {
    this.setState({showDeletePopup: false} as State)
  }

  private reset = () => {
    this.setState({modelName: this.props.model.name} as State)
  }

  private editDescription = e => {
    e.stopPropagation()
    this.setState({editingDescription: true} as State)
  }

  private stopEditDescription(e) {
    e.stopPropagation()
    this.setState({editingDescription: false} as State)
  }

  private handleDescriptionKeyDown = e => {
    if (e.keyCode === 13) {
      this.stopEditDescription(e)
    }
  }

  private handleKeyDown = e => {
    if (e.keyCode === 13) {
      this.save()
    }
  }

  private onDescriptionChange = e => {
    this.setState({description: e.target.value} as State)
  }

  private onModelNameChange = e => {
    this.setState({modelName: e.target.value} as State)
  }

  private save = () => {
    const {modelName, editing, description} = this.state
    if (modelName !== null && !validateModelName(modelName)) {
      return this.setState({showError: true} as State)
    }

    this.setState({loading: true} as State, () => {
      if (editing) {
        this.editModel(modelName, description)
      } else {
        this.addModel(modelName, description)
      }
    })
  }

  private delete = () => {
    this.setState({loading: true} as State, () => {
      Relay.Store.commitUpdate(
        new DeleteModelMutation({
          projectId: this.props.projectId,
          modelId: this.props.model.id,
        }),
        {
          onSuccess: () => {
            this.close()
          },
          onFailure: (transaction) => {
            onFailureShowNotification(transaction, this.props.showNotification)
            this.setState({loading: false} as State)
          },
        },
      )
    })
  }

  private addModel = (modelName: string, description: string) => {
    if (modelName) {
      Relay.Store.commitUpdate(
        new AddModelMutation({
          description,
          modelName,
          projectId: this.props.projectId,
        }),
        {
          onSuccess: () => {
            tracker.track(ConsoleEvents.Schema.Model.created({modelName}))
            if (
              modelName === 'Post' &&
              this.props.gettingStartedState.isCurrentStep('STEP1_CREATE_POST_MODEL')
            ) {
              this.props.showDonePopup()
              this.props.nextStep()
            }
            tracker.track(ConsoleEvents.Schema.Model.Popup.submitted({type: 'Create', name: modelName}))
            this.close()
          },
          onFailure: (transaction) => {
            onFailureShowNotification(transaction, this.props.showNotification)
            this.setState({loading: false} as State)
          },
        },
      )
    }
  }

  private editModel = (modelName: string, description: string) => {
    Relay.Store.commitUpdate(
      new UpdateModelMutation({
        name: modelName,
        description,
        modelId: this.props.model.id,
      }),
      {
        onSuccess: () => {
          tracker.track(ConsoleEvents.Schema.Model.renamed({id: this.props.model.id}))
          this.close()
        },
        onFailure: (transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
          this.setState({loading: false} as State)
        },
      },
    )
  }

  private close = () => {
    const {onRequestClose, router, projectId} = this.props
    if (typeof onRequestClose === 'function') {
      onRequestClose()
    }

    // if we're editing, go back to the schema page of the project
    if (this.props.model) {
      router.goBack()
    }
  }
}

export default connect(
  state => ({gettingStartedState: state.gettingStarted.gettingStartedState}),
  {
    showNotification, nextStep, showDonePopup,
  },
)(withRouter(AddType))
