import * as React from 'react'
import * as cx from 'classnames'
import {$p} from 'graphcool-styles'
import * as Codemirror from 'react-codemirror'
import {CodeGenerator} from '../../../../utils/codeGeneration'
import {GraphQLClient, Environment} from '../../../../types/types'
import {connect} from 'react-redux'
import EditorConfiguration = CodeMirror.EditorConfiguration
import {ConsoleEvents} from 'graphcool-metrics'
import tracker from '../../../../utils/metrics'

interface Props {
  query: string
  endpointUrl: string
  client: GraphQLClient
  environment: Environment
}

class CodeGenerationPopupCode extends React.Component<Props, {}> {
  render() {
    const {client, environment, endpointUrl, query} = this.props

    const generator = new CodeGenerator(client, environment, endpointUrl)
    const projectSetup = generator.getSetup()
    const code = generator.getCode(query)

    return (
      <div className={cx($p.pa38, $p.pt16, 'code-generation-popup')}>
        <h3 className={$p.mt16}>Project Setup</h3>
        <Codemirror
          key={projectSetup}
          value={projectSetup}
          options={{
            height: 100,
            mode: 'shell',
            theme: 'dracula',
          } as EditorConfiguration}
          onFocusChange={(focused) => {
            if (focused) {
              tracker.track(ConsoleEvents.Playground.CodeGenerationPopup.setupFocused())
            }
          }}
        />
        <h3 className={$p.mt16}>Code</h3>
        <Codemirror
          key={code}
          value={code}
          options={{
            mode: 'javascript',
            theme: 'dracula',
          } as EditorConfiguration}
          onFocusChange={(focused) => {
            if (focused) {
              tracker.track(ConsoleEvents.Playground.CodeGenerationPopup.codeFocused())
            }
          }}
        />
      </div>
    )
  }
}

export default connect(state => ({
  environment: state.codeGeneration.environment,
  client: state.codeGeneration.client,
}))(CodeGenerationPopupCode)
