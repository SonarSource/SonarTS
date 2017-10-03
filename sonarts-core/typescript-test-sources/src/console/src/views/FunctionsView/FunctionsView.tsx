import * as React from 'react'
import * as Relay from 'react-relay'
import {Project, ServerlessFunction} from '../../types/types'
import mapProps from '../../components/MapProps/MapProps'
import FunctionsList from './FunctionsList'
import FunctionsHeader from './FunctionsHeader'

interface Props {
  project: Project
  functions: ServerlessFunction
  params: any
}

interface State {

}

import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'

class FunctionsView extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render() {
    return (
      <div className='functions-view'>
        <style jsx>{`
          .functions-view {
          }
        `}</style>
        <FunctionsHeader params={this.props.params} />
        <FunctionsList project={this.props.project} params={this.props.params} />
        {this.props.children}
      </div>
    )
  }
}

const MappedFunctionsView = mapProps({
  project: props => props.viewer.project,
})(FunctionsView)

export default Relay.createContainer(MappedFunctionsView, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
        project: projectByName(projectName: $projectName) {
          id
          name
          ${FunctionsList.getFragment('project')}
        }
        user {
          crm {
            information {
              isBeta
            }
          }
        }
      }
    `,
  },
})
