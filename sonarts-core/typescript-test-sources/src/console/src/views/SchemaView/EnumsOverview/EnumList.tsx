import * as React from 'react'
import {Project, Model, Enum} from '../../../types/types'
import * as Relay from 'react-relay'
import EnumBox from './EnumBox'
import AddEnum from './AddEnum'
import {debounce} from 'lodash'
import mapProps from '../../../components/MapProps/MapProps'

interface Props {
  project: Project
  enums: Enum[]
  opacity?: number
  onEditEnum: (enumValue: Enum) => void
  selectedEnum?: string
  editingEnumName?: string
  setScroll: (n: number) => void
}

class EnumList extends React.Component<Props,null> {
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
    const {opacity, selectedEnum, editingEnumName, enums, project} = this.props
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
          .no-enums {
            @p: .f16, .white50, .pa25;
          }
        `}</style>
        {enums.length > 0 ? (
          <div
            className='type-list'
            style={style}
            onScroll={this.handleScroll}
            ref={ref => {
              this.containerRef = ref
            }}
          >
            {enums.map(enumValue => (
              enumValue.name === editingEnumName ? (
                <AddEnum
                  key={enumValue.id}
                  projectId={this.props.project.id}
                  enumValue={enumValue}
                />
              ) : (
                <EnumBox
                  key={enumValue.id}
                  enumValue={enumValue}
                  projectName={project.name}
                  onEditEnum={this.props.onEditEnum}
                />
              )
            ))}
          </div>
        ) : (
          <div className='no-enums'>
            You don't have any global enum defined yet.
            Click on 'Add Enum' at the top to create a new enum.
          </div>
        )}
      </div>
    )
  }
}

const MappedEnumList = mapProps({
  enums: props => props.project.enums.edges.map(edge => edge.node),
})(EnumList)

export default Relay.createContainer(MappedEnumList, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        name
        enums(first: 1000) {
          edges {
            node {
              id
              name
              values
            }
          }
        }
      }
    `,
  },
})
