import * as React from 'react'
import {Project, Model} from '../../../types/types'
import {SchemaOverviewFilter} from './SchemaOverview'
import * as Relay from 'react-relay'
import TypeBox from './TypeBox'
import AddType from './AddType'
import {debounce} from 'lodash'

interface Props {
  project: Project
  activeFilter: SchemaOverviewFilter
  opacity?: number
  onEditModel: (model: Model) => void
  selectedModel?: string
  editingModelName?: string
  setScroll: (n: number) => void
}

class TypeList extends React.Component<Props,null> {
  private containerRef = null
  private handleScroll = debounce(
    () => {
      const container = this.containerRef
      const scrollPercentage = 100 * container.scrollTop / (container.scrollHeight - container.clientHeight)
      this.props.setScroll(scrollPercentage)
    },
    100,
  )
  render() {
    const {activeFilter, project, opacity, selectedModel, editingModelName} = this.props
    const models = project.models.edges
      .map(edge => edge.node)
      .sort((a, b) => a.id < b.id ? 1 : -1)
    let style = {}
    if (typeof opacity === 'number' && !isNaN(opacity)) {
      style = {opacity}
    }
    return (
      <div
        className='type-list-wrapper'
      >
        <style jsx>{`
          .type-list-wrapper {
            @p: .flex, .flexColumn, .relative, .flex1;
          }
          .type-list-wrapper:after {
            @p: .absolute, .top0, .left0, .right0, .z2;
            content: "";
            height: 16px;
            background: linear-gradient(to bottom, rgba(23, 42, 58, 1), rgba(23, 42, 58, 0));
          }
          .type-list {
            @p: .pl16, .pb16, .pr16, .overflowAuto, .flex1, .nosb;
          }
        `}</style>
        <div
          className='type-list'
          style={style}
          onScroll={this.handleScroll}
          ref={ref => {
            this.containerRef = ref
          }}
        >
          {models.map(model => (
            model.name === editingModelName ? (
              <AddType
                key={model.id}
                projectId={this.props.project.id}
                model={model}
              />
            ) : (
              <TypeBox
                key={model.id}
                model={model}
                projectName={project.name}
                extended={activeFilter === 'detail'}
                onEditModel={this.props.onEditModel}
                highlighted={selectedModel ? model.name === selectedModel : undefined}
              />
            )
          ))}
        </div>
      </div>
    )
  }
}

export default Relay.createContainer(TypeList, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        name
        models(first: 100) {
          edges {
            node {
              itemCount
              id
              name
              isSystem
              description
              permissions(first: 100) {
                edges {
                  node {
                    isActive
                    operation
                    applyToWholeModel
                    fieldIds
                  }
                }
              }
              fields(first: 100) {
                edges {
                  node {
                    id
                    name
                    typeIdentifier
                    isList
                    isRequired
                    isSystem
                    isUnique
                    isReadonly
                    relation {
                      name
                    }
                    relatedModel {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
})
