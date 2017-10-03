import * as React from 'react'
import {Voyager} from 'graphql-voyager'
import fetch from 'isomorphic-fetch'
import * as Relay from 'react-relay'
import {Viewer} from '../../types/types'
import modalStyle from '../../utils/modalStyle'
import {Icon} from 'graphcool-styles'
import * as Modal from 'react-modal'
import {withRouter} from 'react-router'

interface Props {
  viewer: Viewer
  router: ReactRouter.InjectedRouter
}

const customModalStyle = {
  overlay: modalStyle.overlay,
  content: {
    ...modalStyle.content,
    width: '100vw',
    height: '100vh',
    background: 'white',
  },
}

class SchemaViewer extends React.Component<Props, null> {
  render() {
    return (
      <Modal
        isOpen
        style={customModalStyle}
        contentLabel='Voyager'
      >
        <div className='schema-viewer'>
          <style jsx>{`
            .schema-viewer {
              @p: .relative, .w100;
              height: 100vh;
            }
            .close {
              @p: .absolute, .top0, .right0, .pa10, .ma10, .bgWhite, .z999, .pointer, .br100;
              box-shadow: 0 0 30px 30px white;
            }
            :global(#intercom-container) {
              display: none;
            }
          `}</style>
          <Voyager
            introspection={this.introspectionProvider}
            displayOptions={{
              transformSchema: function(schema) {
                const {types} = schema
                const copy = Object.assign({}, types)

                Object.keys(copy).forEach(typeName => {
                  if (typeName.startsWith('_all') || typeName.startsWith('all')) {
                    delete copy[typeName]
                  } else {
                    const type = copy[typeName]

                    if (type.fields) {
                      Object.keys(type.fields).forEach(fieldName => {
                        const field = type.fields[fieldName]
                        if (field.type === '_QueryMeta') {
                          delete copy[typeName].fields[fieldName]
                        }
                      })
                    }
                  }
                })

                return Object.assign({}, schema, {
                  queryType: 'Node',
                  types: copy,
                })
              },
              hideDocs: true,
              hideRoot: true,
            }}
          />
          <div className='close' onClick={this.close}>
            <Icon
              src={require('graphcool-styles/icons/stroke/cross.svg')}
              stroke
              strokeWidth={2}
              width={32}
              height={32}
            />
          </div>
        </div>
      </Modal>
    )
  }

  private close = () => {
    this.props.router.goBack()
  }

  private introspectionProvider = (query) => {
    return fetch(__BACKEND_ADDR__ + '/simple/v1/' + this.props.viewer.project.id, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({query}),
    })
    .then(res => res.json())
  }
}

export default Relay.createContainer(withRouter(SchemaViewer), {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        project: projectByName(projectName: $projectName) {
          id
        }
      }
    `,
  },
})
