import * as React from 'react'
import * as Relay from 'react-relay'
import {QueryEditor} from 'graphiql/dist/components/QueryEditor'
import {SearchProviderAlgolia, Model} from '../../../types/types'
import {withRouter} from 'react-router'
import { buildClientSchema } from 'graphql'
import { validate } from 'graphql/validation'
import { parse } from 'graphql/language'
import AlgoliaQuery from './AlgoliaQuery'
import mapProps from '../../../components/MapProps/MapProps'
import {$v, Icon} from 'graphcool-styles'
import AddAlgoliaSyncQueryMutation from '../../../mutations/AddAlgoliaSyncQueryMutation'
import {showNotification} from '../../../actions/notification'
import {onFailureShowNotification} from '../../../utils/relay'
import {ShowNotificationCallback} from '../../../types/utils'
import {connect} from 'react-redux'
import ConfirmOperartionsPopup from './ConfirmOperationsPopup'
import ConfirmOperationsPopup from './ConfirmOperationsPopup'

interface Props {
  algolia: SearchProviderAlgolia
  models: Model[]
  onRequestClose: Function
  showNotification: ShowNotificationCallback
}

interface State {
  selectedModel: Model
  fragment: string
  fragmentValid: boolean
  title: string
}

class CreateAlgoliaIndex extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      selectedModel: this.props.models[0],
      fragment: emptyAlgoliaFragment,
      fragmentValid: true,
      title: '',
    }
  }
  render() {
    const {algolia, models} = this.props
    const {selectedModel, fragment, title} = this.state
    const valid = this.valid()
    return (
      <div className='create-algolia-index'>
        <style jsx>{`
          .create-algolia-index {
            @inherit: .overflowAuto, .bgDarkBlue, .flex, .flexColumn, .justifyBetween, .w100, .overflowVisible;
            height: 100vh;
          }
          .header {
            @p: .pa38, .f14, .white40, .ttu, .fw6;
          }
          .footer {
            @p: .pa25, .flex, .itemsCenter, .justifyBetween;
            margin-bottom: 80px;
          }
          .button {
            @p: .pointer;
            padding: 9px 16px 10px 16px;
          }
          .delete {
            @p: .red;
          }
          .right {
            @p: .flex, .itemsCenter, .relative;
          }
          .cancel {
            @p: .white50, .f16;
          }
          .save {
            @p: .bgWhite10, .white30, .br2;
          }
          .save.active {
            @p: .bgGreen, .white;
          }
          .bottom {
            @p: .bgDarkerBlue, .flex1, .flex, .flexColumn, .justifyBetween;
          }
          .top {
            @p: .pa38, .relative;
            flex: 0 0 325px;
          }
          .new-index {
            @p: .absolute, .top0, .left0, .bgGreen, .white, .br2, .ttu, .f12, .fw6;
            padding: 2px 5px;
            margin-top: 15px;
            margin-left: -4px;
          }
          .step {
            @p: .fw6, .f14, .white40, .pt38, .ttu;
          }
          select {
            @p: .f25, .fw4, .darkerBlue, .br2, .relative, .w100;
            background: rgb(185, 191, 196);
            box-shadow: none;
            border: none;
            padding: 9px 15px 9px 14px;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          .select-wrapper {
            @p: .relative, .mt25;
            width: 219px;
          }
          .triangle {
            @p: .right0, .absolute, .top0;
            pointer-events: none;
            margin-top: 18px;
            margin-right: 13px;
          }
          .name-selection {
            @p: .f38, .fw3, .white, .mt16;
            background: none;
            &::placeholder {
              @p: .white50;
            }
          }
        `}</style>
        <style jsx global>{`
          .create-algolia-index .CodeMirror {
            @p: .bgDarkerBlue;
          }
          .create-algolia-index .CodeMirror-gutters {
            @p: .bgDarkerBlue;
          }
        `}</style>
        <div className='top'>
          <div className='new-index'>New index</div>
          <div className='step'>
            {'1) Select a Model'}
          </div>
          <div className='select-wrapper'>
            <select value={selectedModel.id} onChange={this.handleModelChange}>
              {models.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
            <div className='triangle'>
              <Icon
                src={require('graphcool-styles/icons/fill/triangle.svg')}
                width={8}
                height={8}
                color={$v.darkerBlue}
                rotate={90}
              />
            </div>
          </div>
          <div className='step'>
            {'2) Choose a Name'}
          </div>
          <input
            value={title}
            placeholder='Select a name ...'
            className='name-selection'
            onChange={this.handleTitleChange}
          />
        </div>
        <div className='bottom'>
          <div>
            <div className='header'>
              {`3) Define a Query`}
            </div>
            <AlgoliaQuery
              algolia={algolia}
              fragment={fragment}
              onFragmentChange={this.handleFragmentChange}
              selectedModel={selectedModel}
            />
          </div>
          <div className='footer'>
            <div className='button cancel'>Cancel</div>
            <div className='right'>
              <div className={'button save' + (valid ? ' active' : '')} onClick={this.create}>Create Index</div>
              {valid && selectedModel.itemCount > 0 && (
                <ConfirmOperationsPopup
                  numOperations={selectedModel.itemCount}
                  onCancel={this.close}
                  onConfirmBreakingChanges={this.create}
                  showReset={false}
                  saveLabel='Create Index'
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  private handleModelChange = (e: any) => {
    const modelId = e.target.value
    const model = this.props.models.find(m => m.id === modelId)
    this.setState({
      selectedModel: model,
    } as State)
  }

  private handleTitleChange = (e: any) => {
    this.setState({
      title: e.target.value,
    } as State)
  }

  private handleFragmentChange = (fragment: string, fragmentValid: boolean) => {
    this.setState({
      fragment,
      fragmentValid,
    } as State)
  }

  private create = () => {
    const {fragment, fragmentValid, title, selectedModel} = this.state
    const {algolia} = this.props

    if (this.valid()) {
      Relay.Store.commitUpdate(
        new AddAlgoliaSyncQueryMutation({
          modelId: selectedModel.id,
          indexName: title,
          fragment,
          searchProviderAlgoliaId: algolia.id,
        }),
        {
          onSuccess: (res) => {
            this.close()
          },
          onFailure: (res) => {
            onFailureShowNotification(res, this.props.showNotification)
          },
        },
      )
    }

  }

  private close() {
    this.props.onRequestClose()
  }

  private valid() {
    return this.state.title.length > 0 && this.state.fragmentValid
  }
}

const ReduxContainer = connect(null, { showNotification })(CreateAlgoliaIndex)

const Container = mapProps({
  algolia: props => props.algolia,
  models: props => {
    return props.project.models.edges.map(edge => edge.node)
  },
})(ReduxContainer)

export default Relay.createContainer(Container, {
  initialVariables: {
    // selectedModelId: 'ciwtmzbd600pk019041qz8b7g',
    // modelIdExists: true,
    selectedModelId: null,
    modelIdExists: false,
  },
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        models(first: 100) {
          edges {
            node {
              id
              name
              itemCount
            }
          }
        }
      }
    `,
    algolia: (props) => Relay.QL`
      fragment on SearchProviderAlgolia {
        ${AlgoliaQuery.getFragment('algolia')}
      }
    `,
  },
})

const emptyAlgoliaFragment = `
  # Here you can select which data should be synced to algolia
  # Use Ctrl+Space for auto completion.
  # This is an example:
  {
    node {
      id
    }
  }
`
