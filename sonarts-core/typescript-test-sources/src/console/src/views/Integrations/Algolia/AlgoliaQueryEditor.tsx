import * as React from 'react'
import * as Relay from 'react-relay'
import {QueryEditor} from 'graphiql/dist/components/QueryEditor'
import {SearchProviderAlgolia, Model} from '../../../types/types'
import {withRouter} from 'react-router'
import { buildClientSchema } from 'graphql'
import { validate } from 'graphql/validation'
import { parse } from 'graphql/language'
import AlgoliaQuery from './AlgoliaQuery'
import ConfirmOperationsPopup from './ConfirmOperationsPopup'

interface Props {
  algolia: SearchProviderAlgolia
  fragment: string
  fragmentChanged: boolean
  onFragmentChange: (fragment: String, valid: boolean) => void
  fragmentValid: boolean
  selectedModel: Model
  onCancel: () => void
  onDelete: () => void
  onUpdate: () => void
}

class AlgoliaQueryEditor extends React.Component<Props, null> {
  render() {
    const {
      algolia,
      fragment,
      onFragmentChange,
      selectedModel,
      onCancel,
      onDelete,
      onUpdate,
      fragmentValid,
      fragmentChanged,
    } = this.props
    return (
      <div className='algolia-query-editor'>
        <style jsx>{`
          .algolia-query-editor {
            @inherit: .overflowAuto, .bgDarkBlue, .flex, .flexColumn, .justifyBetween, .w100;
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
        `}</style>
        <style jsx global>{`
          .algolia-query-editor .CodeMirror {
            background-color: #172A3A;
          }
          .algolia-query-editor .CodeMirror-gutters {
            background-color: #172A3A;
          }
        `}</style>
        <div>
          <div className='header'>
            Search Query
          </div>
          <AlgoliaQuery
            algolia={algolia}
            fragment={fragment}
            onFragmentChange={onFragmentChange}
            selectedModel={selectedModel}
          />
        </div>
        <div className='footer'>
          <div className='button delete' onClick={onDelete}>Delete</div>
          <div className='right'>
            <div className='button cancel' onClick={onCancel}>Cancel</div>
            <div className={'button save' + (fragmentValid ? ' active' : '')} onClick={onUpdate}>Save</div>
            {fragmentValid && selectedModel.itemCount > 0 && fragmentChanged && (
              <ConfirmOperationsPopup
                numOperations={selectedModel.itemCount}
                onCancel={onCancel}
                onConfirmBreakingChanges={onUpdate}
                showReset={true}
                saveLabel='Save'
                resync
              />
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default Relay.createContainer(AlgoliaQueryEditor, {
  initialVariables: {
    // selectedModelId: 'ciwtmzbd600pk019041qz8b7g',
    // modelIdExists: true,
    selectedModelId: null,
    modelIdExists: false,
  },
  fragments: {
    algolia: (props) => Relay.QL`
      fragment on SearchProviderAlgolia {
        ${AlgoliaQuery.getFragment('algolia')}
      }
    `,
  },
})
