import * as React from 'react'
import {Field, Project, Model, Enum} from '../../../types/types'
import * as Relay from 'react-relay'
import {connect} from 'react-redux'
import {showDonePopup, nextStep} from '../../../actions/gettingStarted'
import {showNotification} from '../../../actions/notification'
import {ShowNotificationCallback} from '../../../types/utils'
import {GettingStartedState} from '../../../types/gettingStarted'
import {validateEnumName} from '../../../utils/nameValidator'
import {onFailureShowNotification} from '../../../utils/relay'
import tracker from '../../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'
import Loading from '../../../components/Loading/Loading'
import Tether from '../../../components/Tether/Tether'
import {withRouter} from 'react-router'
import {idToBeginning} from '../../../utils/utils'
import ConfirmEnum from './ConfirmEnum'
import EnumEditor from './EnumEditor'
import AddEnumMutation from '../../../mutations/Enums/AddEnum'
import UpdateEnumMutation from '../../../mutations/Enums/UpdateEnum'
import DeleteEnumMutation from '../../../mutations/Enums/DeleteEnum'

interface State {
  name: string
  values: string[]
  showError: boolean
  editing: boolean
  loading: boolean
  showDeletePopup: boolean
  showValuesError: boolean
}

interface Props {
  onRequestClose?: () => void
  projectId: string
  enumValue: Enum
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

class AddEnum extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      // model
      name: props.enumValue ? props.enumValue.name : '',
      values: props.enumValue ? props.enumValue.values : [],
      // ui state
      showError: false,
      editing: Boolean(props.enumValue),
      loading: false,
      showDeletePopup: false,
      showValuesError: false,
    }
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleEsc)
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleEsc)
  }
  render() {
    const {showError, editing, loading, showDeletePopup, name, values, showValuesError} = this.state
    const {enumValue} = this.props
    let fields
    let permissions

    const breaking = false

    return (
      <div className={'add-enum' + (Boolean(enumValue) ? ' editing' : '')}>
        <style jsx>{`
          .add-enum {
            @p: .mt16, .ml16, .mr16, .bgWhite, .br2, .relative;
            box-shadow: 0 1px 10px $gray30;
          }
          .add-enum.editing {
            @p: .mh0, .mb16;
          }
          .header {
            @p: .pv16, .flex, .itemsCenter, .bb, .bBlack10;
          }
          .badge {
            @p: .bgLightOrange, .white, .relative, .f12, .fw6, .ttu, .top0, .br2, .selfStart, .nowrap;
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
          .values {
            @p: .pa16;
          }
        `}</style>
        <div className='header'>
          {editing ? (
              <div className='badge update'>Update Enum</div>
            ) : (
              <div className='badge'>New Enum</div>
            )}
          <div className='input-wrapper'>
            <input
              type='text'
              className='name-input'
              placeholder='Choose a name...'
              autoFocus
              value={this.state.name}
              onChange={this.onNameChange}
              onKeyDown={this.handleKeyDown}
            />
            {showError && (
              <div className='error'>
                Enums must begin with an uppercase letter and only contain letters, underscores and numbers.
              </div>
            )}
          </div>
        </div>
        <div className='values'>
          <EnumEditor
            enums={this.state.values}
            onChange={this.handleValuesChange}
          />
          {showValuesError && (
            <div className='error'>
              Please add Enum Values
            </div>
          )}
        </div>
        <div className='footer'>
          {editing ? (
              showDeletePopup ? (
                  <ConfirmEnum
                    delete
                    onConfirmDeletion={this.delete}
                    onCancel={this.hideDeletePopup}
                    initialModelName={''}
                    mutatedModelName={''}
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
                <ConfirmEnum
                  onConfirmBreakingChanges={this.save}
                  onResetBreakingChanges={this.reset}
                  initialModelName={''}
                  mutatedModelName={''}
                />
              ) : (
                <Tether
                  style={{
                  pointerEvents: 'none',
                }}
                  steps={[{
                  step: 'STEP1_CREATE_POST_MODEL',
                  title: `Save the Model "Post"`,
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

  private handleValuesChange = (values: string[]) => {
    this.setState({values} as State)
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
    this.setState({name: this.props.enumValue.name} as State)
  }

  private handleKeyDown = e => {
    if (e.keyCode === 13) {
      this.save()
    }
  }

  private onNameChange = e => {
    this.setState({name: e.target.value} as State)
  }

  private save = () => {
    const {name, editing, values} = this.state
    if (values.length === 0) {
      return this.setState({showValuesError: true} as State)
    }
    if (name !== null && !validateEnumName(name)) {
      return this.setState({showError: true} as State)
    }

    this.setState({loading: true} as State, () => {
      if (editing) {
        this.editEnum()
      } else {
        this.addEnum()
      }
    })
  }

  private delete = () => {
    this.setState({loading: true} as State, () => {
      Relay.Store.commitUpdate(
        new DeleteEnumMutation({
          enumId: this.props.enumValue.id,
          projectId: this.props.projectId,
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

  private addEnum = () => {
    const {name, values} = this.state
    if (name && values.length > 0) {
      Relay.Store.commitUpdate(
        new AddEnumMutation({
          name,
          values,
          projectId: this.props.projectId,
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
    }
  }

  private editEnum = () => {
    const {name, values} = this.state
    Relay.Store.commitUpdate(
      new UpdateEnumMutation({
        name,
        values,
        enumId: this.props.enumValue.id,
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
  }

  private close = () => {
    const {onRequestClose, router, projectId} = this.props
    if (typeof onRequestClose === 'function') {
      onRequestClose()
    }

    // if we're editing, go back to the schema page of the project
    if (this.props.enumValue) {
      router.goBack()
    }
  }
}

export default connect(
  state => ({gettingStartedState: state.gettingStarted.gettingStartedState}),
  {
    showNotification, nextStep, showDonePopup,
  },
)(withRouter(AddEnum))
