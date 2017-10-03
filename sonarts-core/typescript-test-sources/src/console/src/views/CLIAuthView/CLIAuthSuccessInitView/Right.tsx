import * as React from 'react'
import { Link } from 'react-router'
import { A } from '../../../components/Links'
const QueryEditor: any = require('../../SchemaView/Editor/QueryEditor').QueryEditor

export default class Right extends React.Component<{}, {}> {

  render() {
    return (
      <div className='example-project-right'>
        <style jsx={true}>{`
          .example-project-right {
            @p: .flex, .flexColumn, .justifyCenter, .pl38, .pr60, .pv60, .flexFixed;
            background-color: #0f202d;
            max-width: 536px;
          }

          .title {
            @p: .pl10, .white70, .f25, .fw6;
          }

          .subtitle {
            @p: .pl10, .pt16, .f16, .white60;
          }

          .project-file {
            @p: .fw6, .white80;
          }

          .info {
            @p: .f16, .white60;
          }

          .code {
            @p: .blue, .mono;
          }

          .editor {
            @p: .mv38, .bgDarkBlue, .overlayShadow;
          }

          .editor :global(.CodeMirror), .editor :global(.CodeMirror-gutters) {
            background: none;
          }
        `}</style>
        <div className='title'>Local development workflow</div>
        <div className='subtitle'>
          There is now a file called <span className='project-file'>project.graphcool</span> in your current folder.
          Open it in your editor to update your schema. Learn more in the&nbsp;
          <A target='https://www.graph.cool/docs/reference/cli/project-files-ow2yei7mew/'>docs</A>
        </div>

        <div className='editor'>
          <QueryEditor
            value={blankExampleProjectFileContents}
            readOnly={true}
          />
        </div>

        <div className='info'>
          You can apply your local changes via <span className='code'>`graphcool push`</span>.
        </div>
      </div>
    )
  }
}

const blankExampleProjectFileContents = `\
# project: <your-project-id>
# version: 1

type File implements Node {
  contentType: String!
  createdAt: DateTime!
  id: ID! @isUnique
  name: String!
  secret: String! @isUnique
  size: Int!
  updatedAt: DateTime!
  url: String! @isUnique
}

type User implements Node {
  createdAt: DateTime!
  id: ID! @isUnique
  updatedAt: DateTime!
}
`
