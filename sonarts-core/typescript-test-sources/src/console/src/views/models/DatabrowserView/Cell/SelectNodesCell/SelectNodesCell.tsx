import * as React from 'react'
import * as cookiestore from 'cookiestore'
import * as fetch from 'isomorphic-fetch'
import * as Modal from 'react-modal'
import {Icon, $v} from 'graphcool-styles'
import Table from './Table/Table'
import SearchBox from './SearchBox'
import * as Immutable from 'seamless-immutable'
import modalStyle from '../../../../../utils/modalStyle'
import {Model, Field} from '../../../../../types/types'
import * as Relay from 'react-relay'
import * as mapProps from 'map-props'
import {isScalar} from '../../../../../utils/graphql'
import TypeTag from '../../../../SchemaView/SchemaOverview/TypeTag'
import Tabs from './Tabs'
import SelectNodesCellFooter from './SelectNodesCellFooter'

interface State {
  startIndex: number
  stopIndex: number
  items: any[]
  count: number
  query: string
  scrollToIndex?: number
  selectedTabIndex: number
  adminAuthToken: string
  values: string[] | null
  changed: boolean
}

interface Props {
  field: Field
  nodeId?: string
  projectId: string
  model: Model
  fields: Field[]
  multiSelect: boolean
  save: (values: string[] | string) => void
  cancel: () => void
  endpointUrl: string
}

class SelectNodesCell extends React.Component<Props, State> {

  private style: any
  private lastQuery: string

  private firstQuery = true

  constructor(props) {
    super(props)

    this.state = {
      startIndex: 0,
      stopIndex: 50,
      items: Immutable([]),
      query: '',
      count: 0,
      scrollToIndex: undefined,
      selectedTabIndex: 1,
      values: null,
      adminAuthToken: cookiestore.has('graphcool_auth_token') && cookiestore.get('graphcool_auth_token'),
      changed: false,
    }

    this.getItems({startIndex: 0, stopIndex: 50}, props.fields)

    this.style = Object.assign({}, modalStyle, {
      overlay: Object.assign({}, modalStyle.overlay, {
        backgroundColor: 'rgba(255,255,255,.4)',
      }),
      content: Object.assign({}, modalStyle.content, {
        width: 'auto',
        minWidth: '600px',
        maxWidth: window.innerWidth - 100 + 'px',
        overflow: 'visible',
      }),
    })

    global['s'] = this
  }

  componentWillReceiveProps(nextProps) {
    const {startIndex, stopIndex} = this.state

    if (nextProps.fields.length !== this.props.fields.length) {
      this.getItems({startIndex, stopIndex}, nextProps.fields)
    }
  }

  render() {

    const {model, fields, field} = this.props
    const {selectedTabIndex} = this.state
    // put id to beginning
    return (
      <Modal
        isOpen={true}
        onRequestClose={this.props.cancel}
        contentLabel={`Select a ${model.name}`}
        style={this.style}
      >
        <style jsx>{`
          .select-user-popup {
            @p: .bgWhite, .relative;
          }
          .title-wrapper {
            @p: .flex, .w100, .itemsCenter, .justifyCenter, .bb, .bBlack10;
            padding: 45px;
          }
          .title {
            @p: .fw3, .f38, .flex, .itemsCenter;
            letter-spacing: 0.54px;
          }
          .header {
            @p: .absolute, .w100, .bbox, .ph25, .z2, .flex, .justifyBetween, .itemsCenter;
            margin-top: -24px;
          }
          .search-box {
            flex: 0 1 400px;
          }
          .selected-user {
            @p: .ml25, .flex, .flexColumn, .justifyCenter, .itemsCenter;
          }
          .selected-user-id {
            @p: .bgBlack04, .pa6, .br2, .black60, .f14, .fw3, .mt10;
            font-family:
              'Source Code Pro',
              'Consolas',
              'Inconsolata',
              'Droid Sans Mono',
              'Monaco',
              monospace;
          }
      `}</style>
        <style jsx global>{`
          .popup-x {
            @p: .absolute, .right0, .top0, .pointer, .pt25, .pr25;
          }
        `}</style>
        <div className='select-user-popup'>
          <div className='title-wrapper'>
            <div className='title'>
              <span>{field.name}</span>
              <TypeTag
                field={field}
                big
              />
            </div>
          </div>
          <Icon
            src={require('graphcool-styles/icons/stroke/cross.svg')}
            stroke={true}
            width={25}
            height={25}
            strokeWidth={2}
            className='popup-x'
            color={$v.gray50}
            onClick={this.props.cancel}
          />
          <div className='header'>
            <Tabs
              options={tabs}
              activeIndex={selectedTabIndex}
              onChangeIndex={this.handleTabChange}
            />
            <div className='search-box'>
              <SearchBox
                placeholder={`Search for a ${model.name} ...`}
                onSearch={this.handleSearch}
                isShown
                clean
              />
            </div>
          </div>
          <Table
            fields={fields}
            model={this.props.model}
            rows={this.state.items}
            rowCount={this.state.count}
            loadMoreRows={this.getItems}
            onRowSelection={this.handleRowSelection}
            scrollToIndex={this.state.scrollToIndex}
            showOption={this.props.multiSelect}
          />
          <SelectNodesCellFooter
            onSetNull={this.handleSetNull}
            onCancel={this.props.cancel}
            onSave={this.save}
            field={this.props.field}
            changed={this.state.changed}
            values={this.state.values}
          />
        </div>
      </Modal>
    )
  }

  private save = () => {
    let values: string | string[] = this.state.values
    if (!this.props.multiSelect) {
      values = (values && values.length > 0) ? values[0] : null
    }
    if (values) {
      values = this.mapNodes(values)
    }
    this.props.save(values)
  }

  private mapNodes(id: string | string[]) {
    if (Array.isArray(id)) {
      return id.map(this.mapNode, this)
    } else {
      return this.mapNode(id)
    }
  }

  private mapNode(id: string) {
    return this.state.items.find(item => item.id === id)
  }

  private handleSetNull = () => {
    this.setState(state => {

      const values = this.props.field.isList ? [] : null
      return {
        ...state,
        items: state.items.map(item => {
          return {
            ...item,
            selected: false,
          }
        }),
        values,
        changed: true,
      }
    })
  }

  private handleRowSelection = ({index, rowData}) => {
    this.setState(state => {
      const {multiSelect} = this.props
      let {items, values} = state
      const row = items[index]

      if (!multiSelect && values && values.length > 0 && row.id !== values[0]) {
        const itemIndex = items.findIndex(item => item.id === values[0])
        items = Immutable.setIn(items, [itemIndex, 'selected'], false)
      }

      // TODO this is tricky and necessary for required relations to be changed
      const newValue = !items[index].selected
      items = Immutable.setIn(items, [index, 'selected'], newValue)

      let newValues = values ? values.slice() : []
      // either remove or add the id to the list of values
      if (newValues.includes(row.id)) {
        const i = newValues.indexOf(row.id)
        newValues.splice(i, 1)
      } else {
        newValues.push(row.id)
      }

      return {
        ...state,
        values: newValues,
        items,
        selectedRowIndex: index,
        changed: true,
      }
    })
  }

  private handleTabChange = index => {
    this.setState({selectedTabIndex: index} as State, this.getItemsFromState)
  }

  private handleSearch = (value) => {
    this.setState({query: value} as State, this.getItemsFromState)
  }

  private getItemsFromState = () => {
    const {startIndex, stopIndex} = this.state
    this.getItems({startIndex, stopIndex})
  }

  /**
   * Gets items according to the settings
   * @param startIndex
   * @param stopIndex
   * @param customFields As we run this function in the constructor (where the props are not yet avilable on this),
   *        we make this available as a parameter
   */
  private getItems = ({startIndex, stopIndex}: {startIndex: number, stopIndex: number}, customFields?: Field[]) => {
    const {query, selectedTabIndex} = this.state
    const tab = tabs[selectedTabIndex]
    const fields = customFields || this.props.fields
    let {firstQuery} = this

    if (fields.length === 0) {
      return
    }

    let filter = ''
    // either there must be a search query or the tab unequal all
    if (!firstQuery && ((query && query.length > 0) || tab !== 'all')) {
      filter = ' filter: {'
      if (query && query.length) {
        filter += 'OR: ['
        const whiteList = ['GraphQLID', 'String']

        const filtered = fields.filter((field: Field) => {
          return whiteList.indexOf(field.typeIdentifier.toString()) > -1
        })

        filter += filtered.map(field => `{${field.name}_contains: "${query}"}`).join(',\n')

        filter += ']'
      }

      if (tab !== 'all') {
        const {values} = this.state
        const not = tab === 'unrelated' ? '_not' : ''
        filter += `id${not}_in: [${values ? values.map(value => `"${value}"`).join(',') : ''}]`
      }

      filter += '}'
    }

    const {nodeId, field} = this.props
    const getRelated = firstQuery
    const count = stopIndex - startIndex + 1
    const nodeSelector = getRelated ? `${field.model.name}(id: "${nodeId}") {` : ''
    const metaQuery = (!firstQuery || field.isList) ? `${this.getAllNameMeta()}${filter ? `(${filter})` : ''} {
          count
        }` : ''
    const queryParams = (!firstQuery || field.isList) ? `(skip: ${startIndex} first: ${count}${filter})` : ''

    // continue: remove query arguments for single relation
    const itemsQuery = `
      {
        ${nodeSelector}
        ${metaQuery}
        ${this.getAllName()}${queryParams}{
          ${fields.map(f => f.name + (isScalar(f.typeIdentifier) ? '' : ' {id} ')).join('\n')}
        }
        ${getRelated ? '}' : ''}
      }
    `

    fetch(
      this.props.endpointUrl,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.state.adminAuthToken}`,
          'X-GraphCool-Source': 'playground',
        },
        body: JSON.stringify({query: itemsQuery}),
      },
    )
      .then(res => res.json())
      .then(res => {

        let pointer = res.data

        if (getRelated) {
          pointer = pointer[field.model.name]
        }

        let meta
        let newItems
        if (!firstQuery || field.isList) {
          meta = pointer[this.getAllNameMeta()]
          newItems = pointer[this.getAllName()]
        } else {
          newItems = pointer[field.name] ? [pointer[field.name]] : []
          meta = {count: newItems.length}
        }

        let {items, values} = this.state

        if (firstQuery) {
          values = newItems.map(item => item.id)
        }

        // reset data if search changed
        if (query !== this.lastQuery) {
          items = Immutable([])
        }

        newItems.forEach((item, i) => {
          if (values && values.includes(item.id)) {
            item['selected'] = true
          }
          items = Immutable.set(items, (i + startIndex), item)
        })

        let newState = {
          items,
          values,
          count: meta.count,
        }

        let goingforAll = false
        if (this.firstQuery && meta.count === 0) {
          newState['selectedTabIndex'] = 0
          this.firstQuery = false
          goingforAll = true
        }

        if (this.lastQuery !== this.state.query) {

          newState['scrollToIndex'] = 0

          setTimeout(
            () => {
              this.setState({
                scrollToIndex: undefined,
              } as State)
            },
            150,
          )
        }

        this.setState(
          newState as State,
          () => {
            if (goingforAll) {
              this.getItemsFromState()
            }
          },
        )

        this.lastQuery = query
        this.firstQuery = false
      })
      .catch(e => console.error(e))
  }

  private getAllName() {
    if (this.props.nodeId && this.state.selectedTabIndex === 1 && this.firstQuery) {
      return this.props.field.name
    }
    return `all${this.props.model.namePlural}`
  }

  private getAllNameMeta() {
    return `_${this.getAllName()}Meta`
  }
}

const tabs = ['all', 'related', 'unrelated']

const MappedSelectNodesCell = mapProps({
  model: props => props.model,
  fields: props => props.model.fields.edges.map(edge => edge.node),
})(SelectNodesCell)

export default Relay.createContainer(MappedSelectNodesCell, {
  fragments: {
    model: () => Relay.QL`
      fragment on Model {
        id
        name
        namePlural
        ${Table.getFragment('model')}
        fields(first: 1000) {
          edges {
            node {
              id
              typeIdentifier
              name
              relatedModel {
                name
              }
            }
          }
        }
      }
    `,
  },
})
