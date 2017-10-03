import * as React from 'react' // tslint:disable-line
import {$p, Icon, $v} from 'graphcool-styles'
import styled from 'styled-components'
import * as cx from 'classnames'
import {buildClientSchema} from 'graphql'
import {CustomGraphiQL} from 'graphcool-graphiql'
import {
  UserType, PermissionRuleType, Operation, Field, FieldType, PermissionVariable,
  PermissionQueryArgument, Relation,
} from '../../../types/types'
import {texts} from '../../../utils/permission'
import PermissionField from '../PermissionsList/ModelPermissions/PermissionField'
import VariableTag from './VariableTag'
import {flatMap, groupBy} from 'lodash'
import {putVariablesToQuery, getVariableNamesFromQuery} from './ast'
import {debounce} from '../../../utils/utils'
import * as Modal from 'react-modal'
import {fieldModalStyle} from '../../../utils/modalStyle'
import {PermissionPopupErrors} from './PermissionPopupState'
import ErrorInfo from '../../models/FieldPopup/ErrorInfo'
import Checkbox from '../../../components/Checkbox'
import {sortBy} from 'lodash'

const ConditionButton = styled.div`
  &:not(.${$p.bgBlue}):hover {
    background-color: ${$v.gray10};
  }
`

const modalStyling = {
  ...fieldModalStyle,
  content: {
    ...fieldModalStyle.content,
    width: window.innerWidth,
  },
  overlay: {
    ...fieldModalStyle.overlay,
    backgroundColor: 'rgba(15,32,46,.9)',
  },
}

interface Props {
  setUserType: (userType: UserType) => void
  toggleUserType: () => void
  toggleRuleType: () => void
  setRuleGraphQuery: (query: string) => void
  onRuleNameChange: (e: any) => void
  userType: UserType
  rule: PermissionRuleType
  permissionSchema: string
  ruleGraphQuery: string
  operation?: Operation
  permissionQueryArguments: PermissionQueryArgument[]
  queryValid: boolean
  showErrors: boolean
  onQueryValidityChange: (valid: boolean) => void
  ruleName: string
  relation?: Relation
  connect?: boolean
  disconnect?: boolean
}

interface State {
  selectedVariableNames: string[]
  fullscreen: boolean
  editingRuleName: boolean
}

export default class PermissionConditions extends React.Component<Props, State> {

  private reflectQueryVariablesToUI = debounce(
    (query: string) => {
      const schema = buildClientSchema(JSON.parse(this.props.permissionSchema))
      const {variables, valid} = getVariableNamesFromQuery(query, true, schema)
      this.setState({
        selectedVariableNames: variables,
      } as State)
      this.props.onQueryValidityChange(valid)
    },
    150,
  )

  constructor(props) {
    super(props)

    this.state = {
      selectedVariableNames: ['nodeId'],
      fullscreen: false,
      editingRuleName: false,
    }
  }

  componentDidMount() {
    this.reflectQueryVariablesToUI(this.props.ruleGraphQuery)
  }

  render() {
    const {
      rule,
      permissionSchema,
      ruleGraphQuery,
      setRuleGraphQuery,
      operation,
      setUserType,
      userType,
      permissionQueryArguments,
      relation,
      connect,
      disconnect,
      toggleUserType,
      toggleRuleType,
    } = this.props
    const {selectedVariableNames, fullscreen} = this.state

    const variables = this.getVariables()
    const disabled = rule !== 'GRAPH'

    return (
      <div className='permission-conditions'>
        <style jsx={true}>{`
          .permission-conditions {
            @p: .overflowAuto;
            max-height: calc(100vh - 150px);
          }
          .whocan {
            @p: .fw6, .mh6;
          }
          .custom-rule {
            @p: .ml4;
          }
          .query-error {
            @p: .absolute;
            top: 185px;
            right: -40px;
          }
          .setting {
            @p: .mt25, .w100, .f16, .black40, .flex, .itemsCenter;
          }
          .label {
            @p: .black40, .f16, .mr10, .ml16;
          }
          .divider {
            @p: .relative, .flex, .justifyCenter, .mt25;
          }
          .divider:before {
            @p: .absolute, .bBlack10, .bb;
            left: -38px;
            right: -38px;
            content: "";
            top: 50%;
          }
          .divider-text {
            @p: .bgWhite, .f16, .tc, .ph6, .relative, .black50;
          }
          .edit-description {
            @p: .pointer, .f16, .black40, .flex, .itemsCenter;
          }
          .description-wrapper {
            @p: .mt25;
            height: 24px;
          }
          .description-wrapper.disabled {
            @p: .o50;
            cursor: initial;
            pointer-events: none;
          }
          .description-input {
            @p: .f16, .db, .w100;
            line-height: 1.3;
            margin-left: 1px;
          }
          .description-icon {
            @p: .bgBlack10, .br100, .flex, .justifyCenter, .itemsCenter;
            width: 26px;
            height: 26px;
          }
          .
        `}</style>
        <div
          className={cx($p.ph38)}
        >
          {operation && (
            <div className={$p.black50}>
              Restrict who can
              <span className='whocan'>{(operation ? operation.toLowerCase() : 'access') + ' data'}</span>
              in the selected fields.
            </div>
          )}
          {relation && (
            <div className={$p.black50}>
              {'Restrict who can '}
              {connect && 'connect'}
              {connect && disconnect && ' / '}
              {disconnect && 'disconnect'}
              <span className='whocan'>{relation.leftModel.name}</span> nodes with
              <span className='whocan'>{relation.rightModel.name}</span> nodes.
            </div>
          )}
          <div className='setting'>
            <Checkbox checked={userType === 'AUTHENTICATED'} onToggle={toggleUserType}>
              <div className='label'>Authentication required</div>
              <Icon
                src={require('graphcool-styles/icons/stroke/lock.svg')}
                color={$v.gray40}
                stroke
                strokeWidth={2}
                height={20}
                width={20}
              />
            </Checkbox>
          </div>
          <div className='divider'>
            <div className='divider-text'>Permission Query (optional)</div>
          </div>
          <div className='setting'>
            <Checkbox checked={rule === 'GRAPH'} onToggle={toggleRuleType}>
              <div className='label'>Use Permission Query</div>
            </Checkbox>
          </div>
          <div className={cx('description-wrapper', {disabled})}>
            {(this.state.editingRuleName || (this.props.ruleName && this.props.ruleName.length > 0)) ? (
                <input
                  type='text'
                  className='description-input'
                  placeholder='Choose a description...'
                  value={this.props.ruleName || ''}
                  onChange={this.props.onRuleNameChange}
                  onKeyDown={this.handleRuleNameKeyDown}
                  autoFocus
                />
              ) : (
                <div className='edit-description' onClick={this.editRuleName}>
                  <Icon
                    src={require('assets/icons/edit_circle_gray.svg')}
                    color={$v.gray40}
                    height={26}
                    width={26}
                  />
                  <span className='underline ml16'>{' add description '}</span>
                  <span className='ml6 black30'> (optional)</span>
                </div>
              )}
          </div>

          {fullscreen ? (
            <Modal
              isOpen={true}
              style={modalStyling}
              contentLabel='Permission Query Editor'
              onRequestClose={this.toggleFullscreen}
            >
              {this.renderQuery()}
            </Modal>
          ) : (
            this.renderQuery()
          )}

        </div>
        {!this.props.queryValid && this.props.showErrors && (
          <div className='query-error'>
            <ErrorInfo>
              The Query is invalid
            </ErrorInfo>
          </div>
        )}
      </div>
    )
  }

  private editRuleName = () => {
    this.setState({editingRuleName: true} as State)
  }

  private handleRuleNameKeyDown = e => {
    if (e.keyCode === 13) {
      this.setState({editingRuleName: false} as State)
    }
  }

  private getVariables() {
    const {permissionQueryArguments, userType} = this.props
    let args = permissionQueryArguments
    if (userType === 'EVERYONE') {
      args = permissionQueryArguments.filter(arg => arg.group !== 'Authenticated User')
    }
    const variables = groupBy(args, arg => arg.group)
    return variables
  }

  private toggleFullscreen = () => {
    this.setState(state => {
      return {
        ...state,
        fullscreen: !state.fullscreen,
      }
    })
  }

  private renderQuery() {
    const {fullscreen, selectedVariableNames} = this.state
    const {ruleGraphQuery, permissionSchema, rule} = this.props
    const variables = this.getVariables()
    const inactive = rule !== 'GRAPH'
    const schema = buildClientSchema(JSON.parse(permissionSchema))

    return (
      <div className={cx('permission-query-wrapper', {fullscreen, inactive})}>
        <style jsx={true}>{`
          .permission-query-wrapper :global(.star) {
            @p: .mr6;
          }
          .permission-query-wrapper :global(.variable-editor) {
            @p: .dn;
          }
          .permission-query-wrapper :global(.query-editor) :global(.CodeMirror) {
            @p: .f12;
            border-bottom-left-radius: 2px;
            border-top-left-radius: 2px;
            line-height: 22px;
          }
          .permission-query-wrapper :global(.queryWrap) {
            border-top: none;
          }
          .permission-query-wrapper {
            @p: .mt38, .flex, .relative;
            height: 300px;
            margin-left: -45px;
            margin-right: -45px;
          }
          .permission-query-wrapper.inactive .after {
            @p: .bgWhite80, .top0, .left0, .bottom0, .right0, .absolute, .z999, .pointer;
          }
          .permission-query-wrapper.fullscreen {
            @p: .bbox, .ma60;
            height: calc(100vh - 120px);
            margin-left: 0;
            margin-right: 0;
          }
          .query {
            @p: .flex1;
          }
          .variable-category {
            @p: .pb38;
          }
          .variables {
            @p: .bgDarkBlue, .br2, .brRight, .overflowYScroll;
            flex: 0 0 220px;
            padding: 20px;
            :global(.tag) {
              @p: .mb6, .mr6;
            }
          }
          .variables.fullscreen {
            flex: 0 0 320px;
          }
          .variable-title {
            @p: .fw6, .f12, .white30, .ttu, .mb16, .flex, .itemsCenter;
          }
          .extend {
            @p: .absolute, .top0, .right0, .pa4, .bgDarkBlue, .pointer;
            margin-top: 17px;
            margin-right: 17px;
            box-shadow: 0 0 8px $darkBlue;
          }
        `}</style>
        <div
          className='extend'
          onClick={this.toggleFullscreen}
        >
          <Icon
            src={
              fullscreen ? require('assets/icons/compress.svg') : require('assets/icons/extend.svg')
            }
            stroke
            strokeWidth={1.5}
            color={$v.white50}
          />
        </div>
        <div className='query'>
          <CustomGraphiQL
            rerenderQuery={true}
            schema={schema}
            variables={''}
            query={ruleGraphQuery}
            fetcher={() => { return null }}
            disableQueryHeader
            queryOnly
            showDocs
            onEditQuery={this.handleEditQuery}
          />
        </div>
        <div className={'variables' + (fullscreen ? ' fullscreen' : '')}>
          {this.sortVariables(Object.keys(variables)).map(group => (
            <div className='variable-category' key={group}>
              <div className='variable-title'>
                <span>{group}</span>
                {group === 'Authenticated User' && (
                  <Icon
                    src={require('graphcool-styles/icons/stroke/lock.svg')}
                    color={$v.white40}
                    stroke
                    strokeWidth={2.5}
                    height={18}
                    width={18}
                    className='ml10'
                  />
                )}
              </div>
              {variables[group].map(variable => (
                <VariableTag
                  key={variable.name}
                  active={selectedVariableNames.includes(variable.name)}
                  onClick={() => this.toggleVariableSelection(variable)}
                  className='tag'
                  variable={variable}
                />
              ))}
            </div>
          ))}
        </div>
        {inactive && (
          <div className='after' onClick={this.props.toggleRuleType}>
          </div>
        )}
      </div>
    )
  }

  private sortVariables(categories) {
    const cats = categories.slice()
    return cats.sort((a, b) => {
      if (a === 'Authenticated User') {
        return -1
      }
      if (b === 'Authenticated User') {
        return 1
      }
      return a < b ? -1 : 1
    })
  }

  private handleEditQuery = (query: string) => {
    this.props.setRuleGraphQuery(query)
    this.reflectQueryVariablesToUI(query)
  }

  private toggleVariableSelection = (variable: PermissionQueryArgument) => {
    this.setState(
      state => {
        const {selectedVariableNames} = state

        if (selectedVariableNames.includes(variable.name)) {
          const index = selectedVariableNames.indexOf(variable.name)

          return {
            ...state,
            selectedVariableNames: [
              ...selectedVariableNames.slice(0, index),
              ...selectedVariableNames.slice(index + 1, selectedVariableNames.length),
            ],
          }
        }

        return {
          ...state,
          selectedVariableNames: selectedVariableNames.concat(variable.name),
        }
      },
      () => {
        const variables = this.getSelectedVariables()
        const newQuery = putVariablesToQuery(this.props.ruleGraphQuery, variables)
        this.props.setRuleGraphQuery(newQuery)
      },
    )
  }

  private getSelectedVariables() {
    const {selectedVariableNames} = this.state
    const variables = this.getVariables()

    return flatMap(Object.keys(variables), group => variables[group])
      .filter(variable => selectedVariableNames.includes(variable.name))
  }
}
