import * as React from 'react'
import {Model} from '../../../types/types'
import * as Relay from 'react-relay'
import FieldItem from './FieldItem'
import {Link} from 'react-router'
import {Icon, $v} from 'graphcool-styles'
import {isScalar} from '../../../utils/graphql'
import TypeBoxSettings from './TypeBoxSettings'
import {idToBeginning} from '../../../utils/utils'
import Tether from '../../../components/Tether/Tether'
import {connect} from 'react-redux'
import {nextStep} from '../../../actions/gettingStarted'
import {GettingStartedState} from '../../../types/gettingStarted'
import Info from '../../../components/Info'
import UpdateModelNameMutation from '../../../mutations/UpdateModelNameMutation'
import {onFailureShowNotification} from '../../../utils/relay'
import {showNotification} from '../../../actions/notification'
import {ShowNotificationCallback} from '../../../types/utils'
import {withRouter} from 'react-router'

interface Props {
  projectName: string
  model: Model
  extended: boolean
  onEditModel: (model: Model) => void
  nextStep: () => void
  gettingStartedState: GettingStartedState
  highlighted?: boolean
  showNotification: ShowNotificationCallback
  router: ReactRouter.InjectedRouter
}

interface State {
  extended?: boolean
  greenBackground: boolean
  editingModelName: boolean
  modelName: string
}

class TypeBox extends React.Component<Props,State> {
  ref: any
  constructor(props) {
    super(props)

    this.state = {
      extended: undefined,
      greenBackground: Boolean(props.highlighted),
      editingModelName: false,
      modelName: props.model.name,
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.extended !== nextProps.extended) {
      this.setState({extended: undefined} as State)
    }
  }
  componentDidMount() {
    this.scrollIntoView()
    setTimeout(
      () => {
        this.setState({greenBackground: false} as State)
      },
      2500,
    )
  }
  componentDidUpdate() {
    this.scrollIntoView()
  }
  scrollIntoView() {
    if (typeof this.props.highlighted === 'boolean' && this.props.highlighted) {
      setTimeout(
        () => {
          this.ref.scrollIntoView()
        },
        100,
      )
    }
  }
  render() {
    const {model, projectName, highlighted} = this.props
    const propsExtended = this.props.extended
    const stateExtended = this.state.extended
    const extended = typeof stateExtended === 'boolean' ? stateExtended : propsExtended
    const fields = model.fields.edges.map(edge => edge.node).sort(idToBeginning)

    const permissions = model.permissions.edges.map(edge => edge.node)
    return (
      <div className={'type-box' + (this.state.greenBackground ? ' highlighted' : '')} ref={ref => this.ref = ref}>
        <style jsx>{`
          .type-box {
            @p: .br2, .bgWhite, .mb16, .relative, .w100;
            box-shadow: 0 1px 10px $gray30;
            transition: .1s linear all;
          }
          .type-box:first-child {
            @p: .mt16;
          }
          .type-box.highlighted {
            background-color: #E9F9EC;
          }
          .type-box-head {
            @p: .flex, .itemsCenter, .bb, .bBlack10, .relative, .justifyBetween, .cbox;
            height: 65px;
          }
          .type-box-head.extended {
            @p: .pb10;
          }
          .flexy {
            @p: .flex, .itemsCenter;
          }
          .type-box-body.extended {
            @p: .mt16;
          }
          .title {
            @p: .ml12, .flex, .itemsCenter;
          }
          .model-name {
            @p: .f20, .fw6, .black80, .pointer;
            letter-spacing: 0.53px;
          }
          .extend-button {
            @p: .bgGreen, .br2, .relative, .flex, .itemsCenter, .justifyCenter, .pointer;
            left: -4px;
            width: 16px;
            height: 16px;
          }
          .extend-button :global(i) {
            @p: .o0;
          }
          .type-box-head:hover .extend-button :global(i) {
            @p: .o100;
          }
          .flat-field-list {
            @p: .black60, .fw6, .f14, .pa16;
          }
          .big-field-list {
            @p: .w100;
          }
          .add-button {
            @p: .bgWhite, .relative, .br2, .buttonShadow, .black60, .ttu, .fw6, .f12, .pa6, .flex, .ml10, .pointer;
            :global(i) {
            }
            span {
              @p: .ml4;
            }
          }
          .add-button :global(i) {
              @p: .o30;
          }
          .add-button:hover {
            @p: .blue;
          }
          .add-button:hover :global(svg) {
            stroke: $blue !important;
          }
          .add-buttons {
            @p: .absolute, .flex;
            left: -14px;
            margin-top: -16px;
          }
          .setting {
            @p: .pv10, .ph16, .flex, .itemsCenter;
            .text {
              @p: .ml10, .f14, .fw6, .black60, .ttu;
            }
          }
          .flexy :global(.simple-button) {
            @p: .mr16, .pa6, .flex, .itemsCenter;
          }
          .flexy :global(.simple-button) span {
            @p: .ml6, .ttu, .black30, .fw6, .f14;
          }
          .flexy :global(.simple-button:hover) span {
            @p: .black50;
          }
          .flexy :global(.simple-button:hover) :global(svg) {
            fill: $gray50 !important;
          }
          .system-tag {
            @p: .bgBlack04, .br2, .black40, .dib, .ml12, .f12, .flex, .itemsCenter, .ph4, .ttu, .fw6;
          }
          a.underline {
            @p: .underline;
          }
          .type-box :global(.settings) {
            @p: .pt25, .pb25, .pr25, .pl10;
          }
          .type-box :global(.settings:hover) :global(svg) {
            fill: $gray50;
          }
          .type-box-head :global(.lock) {
            @p: .ml6;
            opacity: 0.75;
          }
        `}</style>
        <div className={'type-box-head' + (extended ? ' extended' : '')}>
          <div className='flexy'>
            <div className='extend-button' onClick={this.toggleExtended}>
              <Icon
                src={require('graphcool-styles/icons/stroke/arrowDown.svg')}
                stroke
                color={$v.white}
                strokeWidth={4}
                rotate={extended ? 0 : -90}
                height={16}
                width={16}
              />
            </div>
            <div className='title'>
              {this.state.editingModelName ? (
                <input
                  type='text'
                  value={this.state.modelName}
                  className='model-name'
                  onChange={this.onChangeModelName}
                  onKeyDown={this.handleKeyDown}
                  onBlur={this.handleOnBlur}
                  autoFocus
                />
              ) : (
                <div
                  className='model-name'
                  title={model.description || ''}
                  onDoubleClick={this.editModelName}
                >
                  {model.name}
                </div>
              )}
              {model.isSystem && (
                <Info
                  customTip={(
                    <Icon
                      src={require('assets/icons/lock.svg')}
                      className='lock'
                    />
                  )}
                >
                  <span>This is a system type, generated by Graphcool. You can read more about system types </span>
                  <a
                    href='https://www.graph.cool/docs/reference/platform/system-artifacts-uhieg2shio/'
                    about='_blank'
                    className='underline'
                  >
                    here
                  </a>
                </Info>
              )}
            </div>
          </div>
          <div className='flexy'>
            {model.name === 'Post' ? (
              <Tether
                steps={[{
                  step: 'STEP3_CLICK_DATA_BROWSER',
                  title: 'Switch to Data Browser',
                  description: 'In the Data Browser you can view and manage your data ("Post" nodes in our case).',
                }]}
                width={280}
                offsetX={10}
                offsetY={-5}
                zIndex={2000}
                style={{
                  pointerEvents: 'none',
                }}
              >
                  <Link
                    to={`/${projectName}/models/${model.name}/databrowser`}
                    className='simple-button'
                  >
                    <Icon
                      src={require('assets/icons/databrowser.svg')}
                      color={$v.gray30}
                    />
                    <span>Data</span>
                  </Link>
                </Tether>
            ) : (
              <Link
                to={`/${projectName}/models/${model.name}/databrowser`}
                className='simple-button'
              >
                <Icon
                  src={require('assets/icons/databrowser.svg')}
                  color={$v.gray30}
                />
                <span>Data</span>
              </Link>
            )}
            {!model.isSystem && (
              <Link
                className='settings'
                to={`/${projectName}/schema/${model.name}/edit`}
              >
                <Icon
                  src={require('graphcool-styles/icons/fill/settings.svg')}
                  color={$v.gray20}
                />
              </Link>
              /*
              <TypeBoxSettings>
                <div className='setting' onClick={() => this.props.onEditModel(model)}>
                  <Icon
                    src={require('graphcool-styles/icons/fill/settings.svg')}
                    color={$v.gray20}
                  />
                  <div className='text'>Type Settings</div>
                </div>
              </TypeBoxSettings>
               */
            )}
          </div>
        </div>
        {extended && (
          <div className='add-buttons' onClick={e => e.stopPropagation()}>
            {model.name === 'Post' ? (
                <Tether
                  steps={[{
                      step: 'STEP2_CLICK_CREATE_FIELD_IMAGEURL',
                      title: 'Create a field for the image URL',
                    }, {
                      step: 'STEP2_CREATE_FIELD_DESCRIPTION',
                      title: 'Good job!',
                      description: 'Create another field called "description" which is of type "String"',
                    }]}
                  offsetX={1}
                  offsetY={-1}
                  width={240}
                  horizontal='left'
                  zIndex={2}
                >
                  <Link to={`/${projectName}/schema/${model.name}/create`} onClick={this.handleCreateFieldClick}>
                    <div className='add-button'>
                      <Icon
                        src={require('assets/icons/addField.svg')}
                        strokeWidth={1.5}
                        stroke
                        color={$v.black}
                        width={18}
                        height={18}
                      />
                      <span>Add Field</span>
                    </div>
                  </Link>
                </Tether>
              ) : (
                <Link to={`/${projectName}/schema/${model.name}/create`}>
                  <div className='add-button'>
                    <Icon
                      src={require('assets/icons/addField.svg')}
                      strokeWidth={1.5}
                      stroke
                      color={$v.black}
                      width={18}
                      height={18}
                    />
                    <span>Add Field</span>
                  </div>
                </Link>
              )}
            <Link to={`/${projectName}/schema/relations/create?leftModelName=${model.name}`}>
              <div className='add-button'>
                <Icon src={require('assets/icons/addRelation.svg')} strokeWidth={1.5} stroke color={$v.black} />
                <span>Add Relation</span>
              </div>
            </Link>
          </div>
        )}
        <div className={'type-box-body' + (extended ? ' extended' : '')}>
          {!extended && (
            <div className='flat-field-list'>
              {fields.map((field, index) => {
                const text = field.name + (index < (fields.length - 1) ? ', ' : '')
                let link = `/${projectName}/schema/${model.name}/edit/${field.name}`
                if (!isScalar(field.typeIdentifier)) {
                  link = `/${projectName}/schema/relations/edit/${field.relation.name}`
                }
                return (
                  field.isSystem ? (
                    <span key={field.id}>{text}</span>
                  ) : (
                    <Link key={field.id} to={link}>
                      {text}
                    </Link>
                  )
                )
              })}
            </div>
          )}
          {extended && (
            <div className='big-field-list'>
              {fields.map((field, index) => (
                <FieldItem
                  key={field.id}
                  field={field}
                  permissions={permissions}
                  hideBorder={index === 0}
                  projectName={this.props.projectName}
                  modelName={model.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  private handleCreateFieldClick = () => {
    if (
      this.props.gettingStartedState.isCurrentStep('STEP2_CLICK_CREATE_FIELD_IMAGEURL') ||
      this.props.gettingStartedState.isCurrentStep('STEP2_CREATE_FIELD_DESCRIPTION')
    ) {
      this.props.nextStep()
    }
  }

  private toggleExtended = () => {
    this.setState(({extended, ...rest}) => {
      const newExtended = typeof extended === 'boolean' ? !extended : !this.props.extended
      return {
        ...rest,
        extended: newExtended,
      }
    })
  }

  private editModelName = e => {
    if (this.props.model.itemCount === 0) {
      this.setState({editingModelName: true} as State)
    } else {
      const {projectName, model} = this.props
      this.props.router.push(`/${projectName}/schema/${model.name}/edit`)
    }
    e.stopPropagation()
  }

  private handleOnBlur = e => {
    this.editModel(this.state.modelName)
  }

  private handleKeyDown = e => {
    if (e.keyCode === 13) {
      this.editModel(this.state.modelName)
    }
  }

  private stopEditModelName() {
    this.setState({editingModelName: false} as State)
  }

  private editModel = (modelName: string) => {
    Relay.Store.commitUpdate(
      new UpdateModelNameMutation({
        name: modelName,
        modelId: this.props.model.id,
      }),
      {
        onSuccess: () => {
          this.stopEditModelName()
        },
        onFailure: (transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
          this.stopEditModelName()
        },
      },
    )
  }

  private onChangeModelName = e => {
    this.setState({modelName: e.target.value} as State)
  }
}

const ConnectedTypebox = connect(
  state => {
    return {
      gettingStartedState: state.gettingStarted.gettingStartedState,
    }
  },
  { nextStep, showNotification },
)(withRouter(TypeBox))

export default ConnectedTypebox
