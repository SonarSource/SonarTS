import * as React from 'react'
import * as CodeMirror from 'react-codemirror'

interface State {
  isFolded: boolean
}

interface Props {
  maxHeight: number
  options: any
  value: string
}

export default class FoldableCodeMirror extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      isFolded: false,
    }
  }

  render() {
    return this.state.isFolded ? (
      <div
        className='h100'
        style={{maxHeight: this.props.maxHeight}}>
        <CodeMirror
          options={this.props.options}>
          value={this.props.value}
        </CodeMirror>
      </div>
      ) : (
        <CodeMirror
          options={this.props.options}>
          value={this.props.value}
        </CodeMirror>
      )

  }
}

/*
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
*/
/*
<CodeMirror
value={getGraphQLCode(props.literal.trim())}
options={{
  lineNumbers: true,
    mode: props.language,
    readOnly: true,
    lineWrapping: true,
}}
/>
  */
