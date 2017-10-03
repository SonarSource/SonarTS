import * as React from 'react'
import * as Relay from 'react-relay'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {withRouter} from 'react-router'
import {
  toggleNodeSelection, clearNodeSelection, setNodeSelection, setScrollTop, setLoading,
  hideNewRow, toggleSearch, selectCell,
} from '../../../actions/databrowser/ui'
import {resetDataAndUI} from '../../../actions/databrowser/shared'
import {
  setItemCount, setOrder, addNodeAsync, updateNodeAsync,
  reloadDataAsync, loadDataAsync, deleteSelectedNodes,
} from '../../../actions/databrowser/data'
import {Popup} from '../../../types/popup'
import * as Immutable from 'immutable'
import {Icon} from 'graphcool-styles'
import mapProps from '../../../components/MapProps/MapProps'
import Loading from '../../../components/Loading/Loading'
import {showNotification} from '../../../actions/notification'
import {ShowNotificationCallback, TypedValue} from '../../../types/utils'
import NewRow from './NewRow'
import HeaderCell from './HeaderCell'
import AddFieldCell from './AddFieldCell'
import CheckboxCell from './CheckboxCell'
import {calculateFieldColumnWidths} from '../utils'
import {Field, Model, Viewer, Project, OrderBy, FieldWidths} from '../../../types/types'
import ModelHeader from '../ModelHeader'
import {showDonePopup, nextStep} from '../../../actions/gettingStarted'
import {GettingStartedState} from '../../../types/gettingStarted'
import {showPopup, closePopup} from '../../../actions/popup'
import InfiniteTable from '../../../components/InfiniteTable/InfiniteTable'
import {AutoSizer} from 'react-virtualized'
import Cell from './Cell'
import LoadingCell from './LoadingCell'
import {getLokka} from './../../../utils/relay'
import {$p} from 'graphcool-styles'
import * as cx from 'classnames'
import {startProgress, incrementProgress} from '../../../actions/progressIndicator'
import {StateTree, ReduxAction, ReduxThunk} from '../../../types/reducers'
import {
  nextCell, previousCell, nextRow, previousRow, editCell, setBrowserViewRef, setDataBrowserViewRef,
} from '../../../actions/databrowser/ui'
import {GridPosition} from '../../../types/databrowser/ui'
import {classnames} from '../../../utils/classnames'
import {throttle} from 'lodash'
import {LightCell} from './LightCell'
import tracker from '../../../utils/metrics'
import {ConsoleEvents} from 'graphcool-metrics'
import {idToBeginning} from '../../../utils/utils'
import Helmet from 'react-helmet'

const classes: any = require('./DatabrowserView.scss')
const DOCS_PREFIX = 'https://graph.cool/docs/reference/platform/system-artifacts-uhieg2shio'

interface Props {
  relay: Relay.RelayProp
  viewer: Viewer & { model: Model }
  router: ReactRouter.InjectedRouter
  route: any
  params: any
  location: any
  fields: Field[]
  project: Project
  model: Model
  gettingStartedState: GettingStartedState
  showNotification: ShowNotificationCallback
  nextStep: () => void
  startProgress: () => ReduxAction
  incrementProgress: () => ReduxAction
  showPopup: (popup: Popup) => ReduxAction
  closePopup: (id: string) => ReduxAction
  showDonePopup: () => ReduxAction
  newRowActive: boolean
  hideNewRow: () => ReduxAction
  toggleSearch: () => ReduxAction
  setScrollTop: (scrollTop: number) => ReduxAction
  setLoading: (loading: boolean) => ReduxAction
  resetDataAndUI: () => ReduxAction
  clearNodeSelection: () => ReduxAction
  setBrowserViewRef: () => ReduxAction
  setDataBrowserViewRef: (ref: Element) => void

  nextCell: (fields: Field[]) => ReduxThunk
  previousCell: (fields: Field[]) => ReduxThunk
  nextRow: (fields: Field[], modelNamePlural: string) => ReduxThunk
  previousRow: (fields: Field[], modelNamePlural: string) => ReduxThunk

  selectCell: (position: GridPosition) => ReduxAction
  editCell: (position: GridPosition) => ReduxAction
  setNodeSelection: (ids: Immutable.List<string>) => ReduxAction
  deleteSelectedNodes: (lokka: any, projectName: string, modeName: string, model: Model) => ReduxThunk
  toggleNodeSelection: (id: string) => ReduxAction
  searchVisible: boolean
  selectedNodeIds: Immutable.List<string>
  selectedCell: GridPosition
  loading: boolean
  scrollTop: number
  itemCount: number
  editing: boolean
  setItemCount: (itemCount: number) => ReduxAction
  filter: Immutable.Map<string, TypedValue>
  orderBy: OrderBy
  setOrder: (orderBy: OrderBy) => ReduxAction
  nodes: Immutable.List<Immutable.Map<string, any>>
  loaded: Immutable.List<boolean>
  addNodeAsync: (lokka: any, model: Model, fields: Field[], fieldValues: { [key: string]: any }) => ReduxThunk
  updateNodeAsync: (lokka: any,
                    model: Model,
                    fields: Field[],
                    value: TypedValue,
                    field: Field,
                    callback,
                    nodeId: string,
                    index: number) => ReduxThunk
  reloadDataAsync: (lokka: any,
                    modelNamePlural: string,
                    fields: Field[],
                    index?: number,
                    searchQuery?: string) => ReduxThunk
  loadDataAsync: (lokka: any,
                  modelNamePlural: string,
                  field: Field[],
                  first: number,
                  skip: number,
                  searchQuery?: string) => ReduxThunk
  searchQuery: string
}

interface State {
  shouldLeaveRoute: boolean
}

class DatabrowserView extends React.PureComponent<Props, State> {

  shouldComponentUpdate: any

  private lokka: any
  private fieldColumnWidths: FieldWidths
  private mounted: boolean
  private ref: Element
  private wrapperRef: any

  private setSearchQueryThrottled = throttle(
    (q: string) => {
      let queryObject = {query: {}}
      if (q.length > 0) {
        queryObject.query = {q}
      }
      const newLocation = Object.assign({}, this.props.location, queryObject)
      this.props.router.replace(newLocation)
      tracker.track(ConsoleEvents.Databrowser.Search.entered())
    },
    1000,
    {
      // this is very important as otherwise the last change would be ignored
      trailing: true,
    },
  )

  constructor(props: Props) {
    super(props)
    this.lokka = getLokka(this.props.project.id)
    this.fieldColumnWidths = calculateFieldColumnWidths(window.innerWidth - 300, this.props.fields, this.props.nodes)
    this.state = {
      shouldLeaveRoute: true,
    }
  }

  componentWillMount = () => {
    this.reloadData()
  }

  componentDidMount = () => {
    tracker.track(ConsoleEvents.Databrowser.viewed())

    this.mounted = true
    this.props.router.setRouteLeaveHook(this.props.route, (nextLocation) => {
      if (this.props.newRowActive) {
        // TODO with custom dialogs use "return false" and display custom dialog
        if (this.state.shouldLeaveRoute) {
          return true
        }
        graphcoolConfirm('This action could lead to massive data loss.', 'Unsaved Changes')
          .then(() => {
            this.props.resetDataAndUI()
            this.setState(
              {
                shouldLeaveRoute: true,
              } as State,
              () => {
                this.props.resetDataAndUI()
                this.props.router.push(nextLocation)
              },
            )
          })
        return false
      } else {
        return true
      }
    })

    if (this.props.location.query.q && this.props.location.query.q.length > 0) {
      this.props.toggleSearch()
    }

    document.addEventListener('keydown', this.documentKeyDown)
  }

  componentWillUnmount = () => {
    this.props.resetDataAndUI()
    document.removeEventListener('keydown', this.documentKeyDown)
    this.mounted = false
  }

  componentWillReceiveProps = (nextProps: Props) => {
    // reload data if the route changes (since react component will be reused) or if relay gets reloaded via forceFetch
    if (
      this.props.location.pathname !== nextProps.location.pathname
      || this.props.location.search !== nextProps.location.search
      || this.props.location.query !== nextProps.location.query
      || this.props.viewer.model !== nextProps.viewer.model
    ) {
      this.reloadData(0, nextProps)
    }
  }

  forceFetch = () => {
    this.props.relay.forceFetch({}, () => {
      // console.log('force fetched', this.props.model.namePlural, this.props.fields)
      // this.reloadData()
    })
  }

  render() {
    const {model} = this.props
    const docsSuffix = model.name === 'User' ? '#user-model' : model.name === 'File' ? '#file-model' : ''
    return (
      <div
        className={classes.root}
        onKeyDown={this.onKeyDown}
      >
        <Helmet title={`${this.props.model.name} - Data`} />
        <ModelHeader
          params={this.props.params}
          model={this.props.model}
          viewer={this.props.viewer}
          project={this.props.project}
          forceFetchRoot={this.forceFetch}
        >
          <div
            className={classnames(classes.button, classes.search, {
              [classes.active]: this.props.searchVisible,
            })}
          >
            <Icon
              width={16}
              height={16}
              src={require('assets/new_icons/search.svg')}
              onClick={this.props.toggleSearch}
              className={classes.searchicon}
            />
            {this.props.searchVisible && (
              <input
                type='text'
                className={classes.input}
                autoFocus
                defaultValue={this.props.location.query.q || ''}
                onChange={this.setSearchQuery}
              />
            )}
            {this.props.searchVisible && (
              <Icon
                width={16}
                height={16}
                src={require('assets/new_icons/close.svg')}
                className={classes.closeicon}
                onClick={() => {
                  this.props.toggleSearch()
                  tracker.track(ConsoleEvents.Databrowser.Search.toggled())
                }}
              />
            )}
          </div>
          {/* Disabling the import icon until we have proper documentation
           https://github.com/graphcool/console/issues/286 */}
          {/*<input type='file' onChange={this.handleImport} id='fileselector' className='dn'/>*/}
          {/*<label htmlFor='fileselector' className={classes.button}>*/}
          {/*<Icon*/}
          {/*width={16}*/}
          {/*height={16}*/}
          {/*src={require('assets/new_icons/down.svg')}*/}
          {/*/>*/}
          {/*</label>*/}
          <div className={classes.button} onClick={() => {
            this.reloadData(Math.floor(this.props.scrollTop / 47))
            tracker.track(ConsoleEvents.Databrowser.reloaded())
          }}>
            <Icon
              width={16}
              height={16}
              src={require('assets/new_icons/reload.svg')}
            />
          </div>
        </ModelHeader>
        <div
          className={`${classes.table} ${this.props.loading ? classes.loading : ''}`}
          id='data-browser-view-wrapper'
          ref={ref => this.wrapperRef = ref}
        >
          <div
            className={`${classes.tableContainer} w-100`}
            id='data-browser-view'
            tabIndex={100}
          >
            <AutoSizer>
              {({height}) => {
                if (this.props.loading) {
                  return
                }
                // 250 comes from the sidebar, 40 is the spacing left to the sidebar
                return (
                  <InfiniteTable
                    params={this.props.params}
                    selectedCell={this.props.selectedCell}
                    loadedList={this.props.loaded}
                    minimumBatchSize={100}
                    width={this.props.fields.reduce((sum, {name}) => sum + this.fieldColumnWidths[name], 0) + 40 + 250}
                    height={height}
                    scrollTop={this.props.scrollTop}
                    columnCount={this.props.fields.length + 2}
                    columnWidth={(input) => this.getColumnWidth(this.fieldColumnWidths, input)}
                    loadMoreRows={(input) => this.loadData(input.startIndex)}
                    addNew={this.props.newRowActive}
                    onScroll={(input) => this.props.setScrollTop(input.scrollTop)}
                    newRowActive={this.props.newRowActive}
                    updateCalled={this.handleUpdateCalled}

                    hideNewRow={this.props.hideNewRow.bind(this)}
                    addNewNode={this.addNewNode.bind(this)}
                    deleteSelectedNodes={this.deleteSelectedNodes.bind(this)}

                    project={this.props.project}
                    model={this.props.model}

                    headerHeight={74}
                    headerRenderer={this.headerRenderer}
                    fieldColumnWidths={this.fieldColumnWidths}

                    rowCount={this.props.itemCount}
                    rowHeight={47}
                    cellRenderer={this.cellRenderer}
                    loadingCellRenderer={this.loadingCellRenderer}

                    addRowHeight={47}
                  />
                )
              }}
            </AutoSizer>
          </div>
        </div>
        {this.props.loading &&
          <div className={classes.loadingOverlay}>
            <Loading color='#B9B9C8'/>
          </div>
        }
        {this.props.model.isSystem && this.props.itemCount === 0 && (
          <div className={classes.loadingOverlay}>
            <div
              className={cx($p.mt25, $p.flex, $p.flexColumn, $p.justifyCenter)}
            >
              <h2 className={cx($p.fw3, $p.mb16)}>This is a system model. Nodes can only be added via the API.</h2>
              <div className={cx($p.flex, $p.flexRow)}>
                <div className={cx($p.flexAuto)}>
                  <div className={cx($p.black50)}>
                    This model also includes system fields, that are generated by graphcool.
                  </div>
                  <div className={$p.black50}>
                    To learn more about our system models, please have a look in our docs.
                  </div>
                </div>
                <div>
                  <a
                    className={cx(
                      $p.pa16,
                      $p.f16,
                      $p.white,
                      $p.br2,
                      $p.bgGreen,
                      $p.pointer,
                      $p.db,
                    )}
                    href={`${DOCS_PREFIX}${docsSuffix}`}
                    target='_blank'
                  >
                    Docs
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // private handleImport = (e: any) => {
  //   const file = e.target.files[0]
  //   const reader = new FileReader()
  //   reader.onloadend = this.parseImport
  //   reader.readAsText(file)
  // }

  // private parseImport = (e: any) => {
  //   const data = JSON.parse(e.target.result)
  //   const values = []
  //   data.forEach(item => {
  //     const fieldValues = getDefaultFieldValues(this.props.model.fields.edges.map((edge) => edge.node))
  //     Object.keys(item).forEach((key) => fieldValues[key].value = item[key])
  //     values.push(fieldValues)
  //   })
  //   const promises = []
  //   const chunk = 10
  //   const total = Math.max(1, Math.floor(values.length / chunk))
  //   const id = cuid()
  //   this.props.startProgress()
  //   this.props.showPopup({
  //     element: <ProgressIndicator title='Importing' total={total}/>,
  //     id,
  //   })
  //   for (let i = 0; i < total; i++) {
  //     promises.push(
  //       addNodes(
  //          this.lokka, this.props.params.modelName, values.slice(i * chunk, i * chunk + chunk), this.props.fields)
  //         .then(() => this.props.incrementProgress())
  //     )
  //   }
  //   Promise.all(promises).then(() => this.reloadData(0)).then(() => this.props.closePopup(id))
  // }

  private loadingCellRenderer = ({columnIndex}) => {
    if (columnIndex === 0) {
      return (
        <CheckboxCell
          onChange={undefined}
          disabled={true}
          checked={false}
          height={47}
        />
      )
    } else if (columnIndex === this.props.fields.length + 1) { // AddColumn
      return (
        <LoadingCell
          empty={true}
          left={20}
        />
      )
    } else {
      return (
        <LoadingCell
          backgroundColor='#fff'
        />
      )
    }
  }

  private headerRenderer = ({columnIndex}): JSX.Element | string => {
    const {fields, orderBy, selectedNodeIds, nodes, params} = this.props
    if (columnIndex === 0) {
      return (
        <CheckboxCell
          height={74}
          onChange={this.selectAllOnClick}
          checked={selectedNodeIds.size === nodes.size && nodes.size > 0}
        />
      )
    } else if (columnIndex === fields.length + 1) {
      if (this.props.newRowActive) {
        return null
      }
      return <AddFieldCell params={params}/>
    } else {
      const field = fields[columnIndex - 1]
      return (
        <HeaderCell
          key={field.id}
          field={field}
          sortOrder={orderBy.fieldName === field.name ? orderBy.order : null}
          toggleSortOrder={() => this.setSortOrder(field)}
          params={params}
        />
      )
    }
  }

  private cellRenderer = ({rowIndex, columnIndex}): JSX.Element | string => {
    const node = this.props.nodes.get(rowIndex)
    if (!node) {
      return (
        <LoadingCell
          backgroundColor='#fff'
        />
      )
    }
    const nodeId = node.get('id')
    const field = this.props.fields[columnIndex - 1]
    if (columnIndex === 0) {
      return (
        <CheckboxCell
          checked={this.isSelected(nodeId)}
          onChange={() => this.props.toggleNodeSelection(nodeId)}
          height={47}
        />
      )
    } else if (columnIndex === this.props.fields.length + 1) { // AddColumn
      if (this.props.newRowActive) {
        return null
      }
      return (
        <LoadingCell
          empty={true}
          left={20}
        />
      )
    } else {
      const value = node.get(field.name)
      const {selectedCell} = this.props
      const rowHasCursor = selectedCell.row === rowIndex
      const selected = rowHasCursor && selectedCell.field === field.name

      if (!selected) {
        return (
          <LightCell
            value={value}
            field={field}
            rowSelected={this.isSelected(nodeId)}
            rowHasCursor={rowHasCursor}
            onClick={() => this.props.selectCell({ row: rowIndex, field: field.name })}
            onDoubleClick={() => this.props.editCell({ row: rowIndex, field: field.name })}
          />
        )
      }

      return (
        <Cell
          selected={selected}
          rowSelected={this.isSelected(nodeId)}
          backgroundColor='#fff'
          field={field}
          value={value}
          projectId={this.props.project.id}
          projectName={this.props.params.projectName}
          update={(value, field, callback) => this.updateEditingNode(value, field, callback, nodeId, rowIndex)}
          reload={() => this.loadData(rowIndex, 1)}
          nodeId={nodeId}
          rowIndex={rowIndex}
          fields={this.props.fields}
          modelNamePlural={this.props.model.namePlural}
        />
      )
    }
  }

  private getColumnWidth = (fieldColumnWidths: FieldWidths, {index}): number => {
    if (index === 0) { // Checkbox
      return 40
    } else if (index === this.props.fields.length + 1) { // AddColumn
      return 250
    } else {
      return fieldColumnWidths[this.getFieldName(index - 1)]
    }
  }

  private documentKeyDown = (e: any): void => {
    // match on cmd+f/ctrl+f
    // if (e.keyCode === 70 && (e.metaKey || e.ctrlKey)) {
    //   this.props.toggleSearch()
    //   e.preventDefault()
    // }
    this.onKeyDown(e)
  }

  private onKeyDown = (e: any): void => {
    // we don't want to interfer with inputs
    if (e.target instanceof HTMLInputElement) {
      return
    }
    if (e.keyCode === 13 && e.shiftKey) {
      return
    }
    if (this.props.editing) {
      // then it's none of our business,
      // let the cell do the event handling
      return
    }
    switch (e.keyCode) {
      case 37:
        this.props.previousCell(this.props.fields)
        tracker.track(ConsoleEvents.Databrowser.Cell.selected({source: {keyCode: 37}}))
        e.preventDefault()
        break
      case 38:
        this.props.previousRow(this.props.fields, this.props.model.namePlural)
        tracker.track(ConsoleEvents.Databrowser.Cell.selected({source: {keyCode: 38}}))
        e.preventDefault()
        break
      case 9:
      case 39:
        // go back for shift+tab
        if (e.shiftKey) {
          this.props.previousCell(this.props.fields)
        } else {
          this.props.nextCell(this.props.fields)
        }
        tracker.track(ConsoleEvents.Databrowser.Cell.selected({source: {keyCode: 39}}))
        e.preventDefault()
        break
      case 40:
        this.props.nextRow(this.props.fields, this.props.model.namePlural)
        tracker.track(ConsoleEvents.Databrowser.Cell.selected({source: {keyCode: 40}}))
        e.preventDefault()
        break
      case 13:
        const selectedField = this.props.fields.find(f => f.name === this.props.selectedCell.field)
        if (selectedField && !selectedField.isReadonly) {
          this.props.editCell(this.props.selectedCell)
          tracker.track(ConsoleEvents.Databrowser.Cell.selected({source: {keyCode: 13}}))
          e.preventDefault()
        }
        break
    }
  }

  private getFieldName = (index: number): string => {
    return this.props.fields[index].name
  }

  private setSortOrder = (field: Field) => {
    const order: 'ASC' | 'DESC' = this.props.orderBy.fieldName === field.name
      ? (this.props.orderBy.order === 'ASC' ? 'DESC' : 'ASC')
      : 'ASC'

    this.props.setOrder({fieldName: field.name, order})
    this.reloadData()
  }

  private setSearchQuery = (e: any) => {
    this.setSearchQueryThrottled(e.target.value)
  }

  private loadData = (skip: number, first: number = 50): any => {
    const query = this.props.location.query.q || ''
    return this.props.loadDataAsync(this.lokka, this.props.model.namePlural, this.props.fields, skip, first, query)
  }

  private reloadData = (index: number = 0, nextProps: Props = null) => {
    let query = (nextProps ? nextProps.location.query.q : this.props.location.query.q) || ''
    // remove whitespaces from the end of the string
    query = query.replace(/\s*$/, '')
    this.props.reloadDataAsync(this.lokka, this.props.model.namePlural, this.props.fields, index, query)
  }

  private updateEditingNode = (value: TypedValue, field: Field, callback, nodeId: string, rowIndex: number) => {
    this.props.updateNodeAsync(
      this.lokka,
      this.props.model,
      this.props.fields,
      value,
      field,
      callback,
      nodeId,
      rowIndex,
    )
  }

  private addNewNode = (fieldValues: { [key: string]: any }): any => {
    return this.props.addNodeAsync(this.lokka, this.props.model, this.props.fields, fieldValues)
  }

  private isSelected = (nodeId: string): boolean => {
    return this.props.selectedNodeIds.indexOf(nodeId) > -1
  }

  private selectAllOnClick = (checked: boolean) => {
    if (checked) {
      const selectedNodeIds = this.props.nodes.map(node => node.get('id')).toList()
      this.props.setNodeSelection(selectedNodeIds)
    } else {
      this.props.clearNodeSelection()
    }
  }

  private deleteSelectedNodes = () => {
    graphcoolConfirm(`This will delete ${this.props.selectedNodeIds.size} node(s).`)
      .then(() => {
        this.props.deleteSelectedNodes(
          this.lokka,
          this.props.params.projectName,
          this.props.params.modelName,
          this.props.model,
        )
      })
  }

  private handleUpdateCalled = () => {
    if (this.state.shouldLeaveRoute) {
      this.setState({shouldLeaveRoute: false} as State)
    }
  }
}

const mapStateToProps = (state: StateTree) => {
  return {
    gettingStartedState: state.gettingStarted.gettingStartedState,
    newRowActive: state.databrowser.ui.newRowActive,
    selectedNodeIds: state.databrowser.ui.selectedNodeIds,
    selectedCell: state.databrowser.ui.selectedCell,
    scrollTop: state.databrowser.ui.scrollTop,
    searchVisible: state.databrowser.ui.searchVisible,
    loading: state.databrowser.ui.loading,
    editing: state.databrowser.ui.editing,
    itemCount: state.databrowser.data.itemCount,
    filter: state.databrowser.data.filter,
    orderBy: state.databrowser.data.orderBy,
    nodes: state.databrowser.data.nodes,
    loaded: state.databrowser.data.loaded,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      hideNewRow,
      toggleSearch,
      setNodeSelection,
      clearNodeSelection,
      toggleNodeSelection,
      setScrollTop,
      setLoading,
      resetDataAndUI,
      showDonePopup,
      nextStep,
      showPopup,
      closePopup,
      startProgress,
      incrementProgress,
      showNotification,
      setItemCount,
      setOrder,
      addNodeAsync,
      updateNodeAsync,
      reloadDataAsync,
      loadDataAsync,
      deleteSelectedNodes,

      // actions for tab and arrow navigation
      nextCell,
      previousCell,
      nextRow,
      previousRow,

      selectCell,
      editCell,
      setBrowserViewRef,
      setDataBrowserViewRef,
    },
    dispatch)
}

const ReduxContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(DatabrowserView))

const MappedDatabrowserView = mapProps({
  params: (props) => props.params,
  fields: (props) => (
    props.viewer.model.fields.edges
      .map((edge) => edge.node)
      .sort(idToBeginning)
  ),
  model: (props) => props.viewer.model,
  project: (props) => props.viewer.project,
  viewer: (props) => props.viewer,
})(ReduxContainer)

export default Relay.createContainer(MappedDatabrowserView, {
  initialVariables: {
    modelName: null, // injected from router
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        model: modelByName(projectName: $projectName, modelName: $modelName) {
          id
          name
          namePlural
          itemCount
          isSystem
          fields(first: 1000) {
            edges {
              node {
                id
                name
                typeIdentifier
                isList
                isReadonly
                isSystem
                defaultValue
                relatedModel {
                  id
                  name
                }
                reverseRelationField {
                  id
                  isList
                  name
                }
                ${HeaderCell.getFragment('field')}
                ${Cell.getFragment('field')}
              }
            }
          }
          ${NewRow.getFragment('model')}
          ${ModelHeader.getFragment('model')}
        }
        project: projectByName(projectName: $projectName) {
          id
          ${ModelHeader.getFragment('project')}
        }
        ${ModelHeader.getFragment('viewer')}
      }
    `,
  },
})
