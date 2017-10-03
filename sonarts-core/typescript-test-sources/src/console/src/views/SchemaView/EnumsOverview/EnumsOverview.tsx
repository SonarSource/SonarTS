import * as React from 'react'
import EnumsOverviewHeader from './EnumsOverviewHeader'
import EnumList from './EnumList'
import * as Relay from 'react-relay'
import {Project, Enum} from '../../../types/types'
import AddEnum from './AddEnum'
import Tether from '../../../components/Tether/Tether'
import * as cn from 'classnames'

interface Props {
  project: Project
  enums: Enum[]
  location: any
  editingEnumName?: string
  blur: boolean
  setScroll: (n: number) => void
}
export type SchemaOverviewFilter = 'detail' | 'overview'

interface State {
  activeFilter: SchemaOverviewFilter
  addingEnum: boolean
  editingEnum?: Enum
}

class EnumsOverview extends React.Component<Props,State> {
  constructor(props) {
    super(props)

    this.state = {
      activeFilter: 'detail',
      addingEnum: false,
      editingEnum: undefined,
    }
  }
  render() {
    const {editingEnumName, blur} = this.props
    const {activeFilter, addingEnum} = this.state
    let selectedEnum = undefined
    if (this.props.location.query.hasOwnProperty('selectedEnum')) {
      selectedEnum = this.props.location.query.selectedEnum
    }

    return (
      <div
        className={cn('schema-overview', {blur})}
      >
        <style jsx>{`
          .schema-overview {
            @p: .bgDarkBlue, .w100, .flex, .flexColumn;
            transition: .3s linear all;
          }
          .schema-overview.blur {
            @p: .o50;
            filter: blur(5px);
          }
          .schema-overview-header {
            @p: .flexFixed;
          }
        `}</style>
        <div className='schema-overview-header'>
          {addingEnum ? (
              <AddEnum
                onRequestClose={this.closeAddEnum}
                projectId={this.props.project.id}
                enum={null}
              />
            ) : (
              <Tether
                style={{
                pointerEvents: 'none',
              }}
                steps={[{
                step: 'STEP1_CREATE_POST_MODEL',
                title: `Create a Enum called "Post"`,
                description: 'Enums represent a certain type of data. To manage our Instagram posts, the "Post" model will have an image URL and a description.', // tslint:disable-line
              }]}
                offsetX={14}
                offsetY={-22}
                width={351}
                horizontal='left'
                key='STEP3_CLICK_ADD_NODE2'
                zIndex={1000}
              >
                <EnumsOverviewHeader
                  projectId={this.props.project.id}
                  onOpenAddEnum={this.openAddEnum}
                />
              </Tether>
            )}
        </div>
        <EnumList
          project={this.props.project}
          opacity={addingEnum ? 0.5 : 1}
          onEditEnum={this.handleEditEnum}
          selectedEnum={selectedEnum}
          editingEnumName={editingEnumName}
          setScroll={this.props.setScroll}
        />
      </div>
    )
  }
  private handleFilterChange = (filter: SchemaOverviewFilter) => {
    this.setState({activeFilter: filter} as State)
  }
  private closeAddEnum = () => {
    this.setState({addingEnum: false, editingEnum: undefined} as State)
  }
  private openAddEnum = () => {
    this.setState({addingEnum: true} as State)
  }
  private handleEditEnum = (model: Enum) => {
    this.setState({
      editingEnum: model,
      addingEnum: true,
    } as State)
  }
}

export default Relay.createContainer(EnumsOverview, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id
        ${EnumList.getFragment('project')}
      }
    `,
  },
})
