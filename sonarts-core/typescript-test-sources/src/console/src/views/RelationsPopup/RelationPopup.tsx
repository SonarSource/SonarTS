import * as React from 'react'
import * as Relay from 'react-relay'
import {Transaction} from 'react-relay'
import {RelationPopupDisplayState, Cardinality, Model, Relation} from '../../types/types'
import RelationHeader from './RelationHeader'
import PopupWrapper from '../../components/PopupWrapper/PopupWrapper'
import {withRouter} from 'react-router'
import RelationFooter from './RelationFooter'
import DefineRelation from './DefineRelation'
import SetMutation from './SetMutation'
import AddRelationMutation from '../../mutations/AddRelationMutation'
import UpdateRelationMutation from '../../mutations/UpdateRelationMutation'
import {lowercaseFirstLetter, removeDuplicatesFromStringArray} from '../../utils/utils'
import BreakingChangeIndicator from './BreakingChangeIndicator'
import DeleteRelationMutation from '../../mutations/DeleteRelationMutation'
import {ShowNotificationCallback} from '../../types/utils'
import {connect} from 'react-redux'
import {showNotification} from '../../actions/notification'
import {bindActionCreators} from 'redux'
import Loading from '../../components/Loading/Loading'
import {onFailureShowNotification} from '../../utils/relay'
import * as Modal from 'react-modal'
import ModalDocs from '../../components/ModalDocs/ModalDocs'
import {fieldModalStyle} from '../../utils/modalStyle'

const customModalStyle = {
  overlay: fieldModalStyle.overlay,
  content: {
    ...fieldModalStyle.content,
    width: 745,
  },
}

interface State {

  loading: boolean
  creating: boolean

  displayState: RelationPopupDisplayState
  leftSelectedModel: Model | null
  rightSelectedModel: Model | null
  selectedCardinality: Cardinality
  relationName: string
  relationDescription: string
  fieldOnLeftModelName: string | null
  fieldOnRightModelName: string | null
  leftInputIsBreakingChange: boolean
  rightInputIsBreakingChange: boolean
  relationNameIsBreakingChange: boolean
  leftModelIsBreakingChange: boolean
  rightModelIsBreakingChange: boolean
  cardinalityIsBreakingChange: boolean
  fieldOnLeftModelIsRequired: boolean
  fieldOnRightModelIsRequired: boolean
}

interface Props {
  router: ReactRouter.InjectedRouter
  viewer: any
  relay: Relay.RelayProp
  showNotification: ShowNotificationCallback
  location: any
}

class RelationPopup extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    const {relation} = props.viewer

    const {leftModelName} = this.props.location.query
    let preselectedModel
    if (leftModelName) {
      preselectedModel = this.props.viewer.project.models.edges.map((edge) => edge.node)
        .find((node) => node.name === leftModelName)
    }

    this.state = {
      loading: false,
      creating: !Boolean(relation),
      displayState: 'DEFINE_RELATION' as RelationPopupDisplayState,
      leftSelectedModel: preselectedModel ? preselectedModel : relation ? relation.leftModel : null,
      rightSelectedModel: relation ? relation.rightModel : null,
      selectedCardinality: relation ?
        this.cardinalityFromRelation(relation) : 'ONE_TO_ONE' as Cardinality,
      relationName: relation ? relation.name : '',
      relationDescription: relation ? relation.description : '',
      fieldOnLeftModelName: relation ? relation.fieldOnLeftModel.name : null,
      fieldOnRightModelName: leftModelName ? leftModelName : relation ? relation.fieldOnRightModel.name : null,
      fieldOnLeftModelIsRequired: relation ? relation.fieldOnLeftModel.isRequired : false,
      fieldOnRightModelIsRequired: relation ? relation.fieldOnRightModel.isRequired : false,
      leftInputIsBreakingChange: false,
      rightInputIsBreakingChange: false,
      relationNameIsBreakingChange: false,
      leftModelIsBreakingChange: false,
      rightModelIsBreakingChange: false,
      cardinalityIsBreakingChange: false,
    }
  }

  render() {

    const {relation} = this.props.viewer
    const models = this.props.viewer.project.models.edges.map(edge => edge.node)

    // compute forbidden field name for left model
    let forbiddenFieldNamesForLeftModel = []
    if (this.state.leftSelectedModel) {
      const modelWithFields = models.find(model => this.state.leftSelectedModel.id === model.id)
      forbiddenFieldNamesForLeftModel = modelWithFields.fields.edges.map(edge => edge.node.name)
    }

    // compute forbidden field name for right model
    let forbiddenFieldNamesForRightModel = []
    if (this.state.rightSelectedModel) {
      const modelWithFields = models.find(model => this.state.rightSelectedModel.id === model.id)
      forbiddenFieldNamesForRightModel = modelWithFields.fields.edges.map(edge => edge.node.name)
    }

    // if (relation) {
    //   forbiddenFieldNamesForLeftModel = forbiddenFieldNamesForLeftModel.filter(fieldName =>
    //   fieldName !== relation.fieldOnLeftModel.name && fieldName !== relation.fieldOnRightModel.name)
    // }

    // let forbiddenFieldNamesForRightModel = removeDuplicatesFromStringArray(
    //   this.props.viewer.project.fields.edges.map(edge => edge.node.name),
    // )
    // if (relation) {
    //   forbiddenFieldNamesForRightModel = forbiddenFieldNamesForRightModel.filter(fieldName =>
    //   fieldName !== relation.fieldOnLeftModel.name && fieldName !== relation.fieldOnRightModel.name)
    // }

    const {displayState, leftSelectedModel, rightSelectedModel,
      selectedCardinality, relationName, relationDescription,
      fieldOnRightModelName, fieldOnLeftModelName, leftModelIsBreakingChange, rightModelIsBreakingChange,
      leftInputIsBreakingChange, rightInputIsBreakingChange, relationNameIsBreakingChange,
      fieldOnLeftModelIsRequired, fieldOnRightModelIsRequired,
    } = this.state

    let displayBreakingIndicator = false
    const noItems = leftSelectedModel && leftSelectedModel.itemCount === 0
      && rightSelectedModel && rightSelectedModel.itemCount === 0

    if (!noItems) {
      displayBreakingIndicator = (Boolean(this.props.viewer.relation)) &&
        (leftInputIsBreakingChange || rightInputIsBreakingChange ||
        relationNameIsBreakingChange || leftModelIsBreakingChange || rightModelIsBreakingChange)
    }

    const rightTabHasBreakingChange = !noItems && relationNameIsBreakingChange
    const leftTabHasBreakingChange = !noItems && (leftInputIsBreakingChange || rightInputIsBreakingChange ||
      leftModelIsBreakingChange || rightModelIsBreakingChange)

    const displayBreakingIndicatorOnLeftTab = !noItems && leftTabHasBreakingChange && displayState !== 'DEFINE_RELATION'
    const displayBreakingIndicatorOnRightTab = !noItems && rightTabHasBreakingChange && displayState !== 'SET_MUTATIONS'

    const displayBreakingIndicatorOnCurrentView = !noItems && (
        (displayState === 'DEFINE_RELATION' as RelationPopupDisplayState && leftTabHasBreakingChange) ||
        (displayState === 'SET_MUTATIONS' as RelationPopupDisplayState && rightTabHasBreakingChange)
      )

    const isBeta = this.props.viewer.user.crm.information.isBeta

    const breakingChangeMessageElements: JSX.Element[] =
      displayBreakingIndicator && this.breakingChangeMessages().map((message, i) =>
        <div key={i}>{message}</div>)
    const infoMessageElement: JSX.Element[] = [(
      <div>
        <div><b>Breaking Changes:</b></div>
        {breakingChangeMessageElements}
      </div>
    )]

    return (
      <Modal
        isOpen
        onRequestClose={this.close}
        contentLabel='Relation'
        style={customModalStyle}
      >
        <style global jsx>{`
          .relationPopupContent {
            @inherit: .buttonShadow;
            width: 745px;
          }

          .overlay {
            @p: .absolute, .flex, .itemsCenter, .justifyCenter;
            top: 0px;
            bottom: 0px;
            left: 0px;
            right: 0px;
            background-color: rgb(250,250,250);
          }
        `}</style>
        <ModalDocs
          title='How to define Relations'
          id='relations-popup'
          resources={[
            {
              title: 'An introduction to Relations',
              type: 'guide',
              link: 'https://www.graph.cool/docs/reference/platform/relations-goh5uthoc1/',
            },
          ]}
          videoId='3EdEcyBc1RI'
        >
        <div className='flex itemsCenter justifyCenter w100 h100 bgWhite90'>
          <BreakingChangeIndicator
            className='relationPopupContent'
            indicatorStyle='RIGHT'
            width={35}
            height={21}
            offsets={displayBreakingIndicatorOnCurrentView ? [40] : []}
            plain={displayBreakingIndicatorOnCurrentView ? [false] : []}
            messages={infoMessageElement}
          >
            <div className='flex flexColumn justifyBetween h100 bgWhite relative'>
              <div>
                <RelationHeader
                  displayState={displayState}
                  switchDisplayState={this.switchToDisplayState}
                  close={this.close}
                  breakingChanges={[displayBreakingIndicatorOnLeftTab, displayBreakingIndicatorOnRightTab]}
                  creating={this.state.creating}
                />
                {
                  displayState === 'DEFINE_RELATION' ?
                    <DefineRelation
                      models={models}
                      leftSelectedModel={leftSelectedModel}
                      rightSelectedModel={rightSelectedModel}
                      selectedCardinality={selectedCardinality}
                      didSelectLeftModel={this.didSelectLeftModel}
                      didSelectRightModel={this.didSelectRightModel}
                      didSelectCardinality={this.didSelectCardinality}
                      rightFieldName={fieldOnRightModelName}
                      rightFieldType={this.rightFieldType()}
                      leftFieldName={fieldOnLeftModelName}
                      leftFieldType={this.leftFieldType()}
                      didChangeFieldNameOnLeftModel={this.didChangeFieldNameOnLeftModel}
                      didChangeFieldNameOnRightModel={this.didChangeFieldNameOnRightModel}
                      fieldOnLeftModelName={fieldOnLeftModelName}
                      fieldOnRightModelName={fieldOnRightModelName}
                      fieldOnLeftModelIsRequired={fieldOnLeftModelIsRequired}
                      fieldOnRightModelIsRequired={fieldOnRightModelIsRequired}
                      didChangeFieldOnLeftModelIsRequired={this.didChangeFieldOnLeftModelIsRequired}
                      didChangeFieldOnRightModelIsRequired={this.didChangeFieldOnRightModelIsRequired}
                      leftInputIsBreakingChange={leftInputIsBreakingChange}
                      rightInputIsBreakingChange={rightInputIsBreakingChange}
                      leftModelIsBreakingChange={leftModelIsBreakingChange}
                      rightModelIsBreakingChange={rightModelIsBreakingChange}
                      forbiddenFieldNamesForLeftModel={forbiddenFieldNamesForLeftModel}
                      forbiddenFieldNamesForRightModel={forbiddenFieldNamesForRightModel}
                      isBeta={isBeta}
                    />
                    :
                    <SetMutation
                      relationName={relationName}
                      relationDescription={relationDescription}
                      onChangeRelationNameInput={this.onChangeRelationNameInput}
                      onChangeRelationDescriptionInput={this.onChangeRelationDescriptionInput}
                      leftSelectedModel={leftSelectedModel}
                      rightSelectedModel={rightSelectedModel}
                      selectedCardinality={selectedCardinality}
                      fieldOnLeftModelName={fieldOnLeftModelName}
                      fieldOnRightModelName={fieldOnRightModelName}
                      relationNameIsBreakingChange={relationNameIsBreakingChange}
                      isEditingExistingRelation={Boolean(relation)}
                    />
                }
              </div>
              <RelationFooter
                displayState={displayState}
                switchDisplayState={this.switchToDisplayState}
                onClickCreateRelation={this.addRelation}
                onClickEditRelation={this.editRelation}
                onClickDeleteRelation={this.deleteRelation}
                resetToInitialState={this.resetToInitialState}
                canSubmit={leftSelectedModel && rightSelectedModel && relationName.length > 0}
                isEditingExistingRelation={Boolean(relation)}
                close={this.close}
                leftModel={relation && relation.leftModel}
                rightModel={relation && relation.rightModel}
                relationName={relation && relation.name}
                displayConfirmBreakingChangesPopup={displayBreakingIndicator}
              />
              {this.state.loading &&
              <div className='overlay'>
                <Loading/>
              </div>
              }
            </div>
          </BreakingChangeIndicator>
        </div>
        </ModalDocs>
      </Modal>
    )
  }

  private close = () => {
    this.props.router.goBack()
  }

  private switchToDisplayState = (displayState: RelationPopupDisplayState) => {
    if (displayState !== this.state.displayState) {
      this.setState({displayState: displayState} as State)
    }
  }

  private didChangeFieldNameOnLeftModel = (newFieldName: string) => {
    const {relation} = this.props.viewer

    this.setState({
      fieldOnLeftModelName: newFieldName,
    } as State)
    if (relation) {
      this.setState({
        leftInputIsBreakingChange: relation ? newFieldName !== relation.fieldOnLeftModel.name : false,
      } as State)
    }
  }

  private didChangeFieldNameOnRightModel = (newFieldName: string) => {
    const {relation} = this.props.viewer

    this.setState({
      fieldOnRightModelName: newFieldName,
    } as State)
    if (relation) {
      this.setState({
        rightInputIsBreakingChange: relation ? newFieldName !== relation.fieldOnRightModel.name : false,
      } as State)
    }
  }

  private didChangeFieldOnRightModelIsRequired = (isRequired: boolean) => {
    this.setState({
      fieldOnRightModelIsRequired: isRequired,
    } as State)
  }

  private didChangeFieldOnLeftModelIsRequired = (isRequired: boolean) => {
    this.setState({
      fieldOnLeftModelIsRequired: isRequired,
    } as State)
  }

  private didSelectLeftModel = (model: Model) => {
    const {relation} = this.props.viewer
    this.setState(
      {
        leftSelectedModel: model,
      } as State,
      () => {
        this.updateFieldNames(model)
      },
    )
  }

  private didSelectRightModel = (model: Model) => {
    const {relation} = this.props.viewer
    this.setState(
      {
        rightSelectedModel: model,
      } as State,
      () => {
       this.updateFieldNames(model)
      },
    )
  }

  private updateFieldNames = (model: Model) => {
    this.setState(
      state => {
        const {relation} = this.props.viewer
        let relationName = state.relationName
        const relationNames = this.props.viewer.project.relations.edges.map(edge => edge.node.name)
        let counter = 0
        if (state.leftSelectedModel && state.rightSelectedModel) {
          relationName = `${state.leftSelectedModel.name}On${state.rightSelectedModel.name}`
          if (relationNames.includes(relationName)) {
            counter = 1
            while (relationNames.includes(`${relationName}${counter}`)) {
              counter++
            }
          }
        }
        if (counter > 0) {
          relationName += counter
        }
        return {
          ...state,
          fieldOnRightModelName: this.rightFieldName(),
          fieldOnLeftModelName: this.leftFieldName(),
          leftModelIsBreakingChange: relation ? relation.leftModel.name !== model.name : false,
          relationName,
        }
      },
    )
  }

  private didSelectCardinality = (cardinality: Cardinality) => {
    const {relation} = this.props.viewer
    this.setState(
      {
        selectedCardinality: cardinality,
      } as State,
      () => {
        const newLeftFieldName = this.leftFieldName()
        const newRightFieldName = this.rightFieldName()
        this.setState({
          fieldOnLeftModelName: newLeftFieldName,
          leftInputIsBreakingChange: relation ? newLeftFieldName !== relation.fieldOnLeftModel.name : false,
          fieldOnRightModelName: newRightFieldName,
          rightInputIsBreakingChange: relation ? newRightFieldName !== relation.fieldOnRightModel.name : false,
          cardinalityIsBreakingChange: relation ? this.cardinalityFromRelation(relation) !== cardinality : false,
          fieldOnLeftModelIsRequired: false,
          fieldOnRightModelIsRequired: false,
        } as State)
      })
  }

  private rightFieldName = () => {
    const {relation} = this.props.viewer
    const {leftSelectedModel, rightSelectedModel, selectedCardinality} = this.state

    // make sure we don't overwrite the existing name for the original cardinality
    if (relation) {
      const originalCardinality = this.cardinalityFromRelation(relation)
      if (originalCardinality === selectedCardinality) {
        return relation.fieldOnRightModel.name
      }
    }

    // edge case: self relations
    if ((leftSelectedModel && rightSelectedModel) && (leftSelectedModel.name === rightSelectedModel.name)) {
      if (selectedCardinality === 'ONE_TO_ONE') {
        return lowercaseFirstLetter(rightSelectedModel.name) + '2'
      } else if (selectedCardinality === 'ONE_TO_MANY') {
        return lowercaseFirstLetter(rightSelectedModel.namePlural) + '2'
      } else if (selectedCardinality === 'MANY_TO_ONE') {
        return lowercaseFirstLetter(rightSelectedModel.name) + '2'
      } else if (selectedCardinality === 'MANY_TO_MANY') {
        return lowercaseFirstLetter(rightSelectedModel.namePlural) + '2'
      }
    }

    if (!leftSelectedModel) {
      return null
    }

    if (selectedCardinality.startsWith('MANY')) {
      return lowercaseFirstLetter(leftSelectedModel.namePlural)
    }
    return lowercaseFirstLetter(leftSelectedModel.name)
  }

  private leftFieldName = () => {
    const {relation} = this.props.viewer
    const {leftSelectedModel, rightSelectedModel, selectedCardinality} = this.state

    // make sure we don't overwrite the existing name for the original cardinality
    if (relation) {
      const originalCardinality = this.cardinalityFromRelation(relation)
      if (originalCardinality === selectedCardinality) {
        return relation.fieldOnLeftModel.name
      }
    }

    if ((leftSelectedModel && rightSelectedModel) && (leftSelectedModel.name === rightSelectedModel.name)) {
      if (selectedCardinality === 'ONE_TO_ONE') {
        return lowercaseFirstLetter(rightSelectedModel.name) + '1'
      } else if (selectedCardinality === 'ONE_TO_MANY') {
        return lowercaseFirstLetter(rightSelectedModel.namePlural) + '1'
      } else if (selectedCardinality === 'MANY_TO_ONE') {
        return lowercaseFirstLetter(rightSelectedModel.name) + '1'
      } else if (selectedCardinality === 'MANY_TO_MANY') {
        return lowercaseFirstLetter(rightSelectedModel.namePlural) + '1'
      }
    }

    if (!rightSelectedModel) {
      return null
    }
    if (selectedCardinality.endsWith('MANY')) {
      return lowercaseFirstLetter(rightSelectedModel.namePlural)
    }
    return lowercaseFirstLetter(rightSelectedModel.name)
  }

  private rightFieldType = () => {
    const {leftSelectedModel, selectedCardinality, fieldOnRightModelIsRequired} = this.state

    if (!leftSelectedModel) {
      return null
    }

    if (selectedCardinality.startsWith('MANY')) {
      return '[' + leftSelectedModel.name + '!]!'
    }
    const required = fieldOnRightModelIsRequired ? '!' : ''
    return leftSelectedModel.name + required
  }

  private leftFieldType = () => {
    const {rightSelectedModel, selectedCardinality, fieldOnLeftModelIsRequired} = this.state

    if (!rightSelectedModel) {
      return null
    }
    if (selectedCardinality.endsWith('MANY')) {
      return '[' + rightSelectedModel.name + '!]!'
    }
    const required = fieldOnLeftModelIsRequired ? '!' : ''
    return rightSelectedModel.name + required
  }

  private onChangeRelationNameInput = (relationName: string) => {
    this.setState({
      relationName: relationName,
    } as State)
    if (this.props.viewer.relation) {
      this.setState({
        relationNameIsBreakingChange: relationName !== this.props.viewer.relation.name,
      } as State)
    }
  }

  private onChangeRelationDescriptionInput = (relationDescription: string) => {
    this.setState({
      relationDescription: relationDescription,
    } as State)
  }

  private cardinalityFromRelation (relation: Relation): Cardinality {
    // sanity check
    if (!relation) {
      console.error('ERROR: NO RELATION')
      return null
    }

    if (!relation.fieldOnLeftModel || !relation.fieldOnRightModel) {
      return `ONE_TO_ONE` as Cardinality
    }

    const leftCardinalityValue = relation.fieldOnRightModel.isList ? 'MANY' : 'ONE'
    const rightCardinalityValue = relation.fieldOnLeftModel.isList ? 'MANY' : 'ONE'
    return (leftCardinalityValue + '_TO_' + rightCardinalityValue) as Cardinality
  }

  private breakingChangeMessages = (): string[] => {
    // sanity check since this will only ever be needed when there is already an existing relation
    if (!this.props.viewer.relation) {
      return []
    }

    const {leftSelectedModel, rightSelectedModel} = this.state
    if (leftSelectedModel.itemCount === 0 && rightSelectedModel.itemCount === 0) {
      return []
    }

    let messages: string[] = []

    const relationNameIsBreakingChangeMessage = 'The relation was renamed to \'' + this.state.relationName +
      '\' (was \'' + this.props.viewer.relation.name + '\' before).'
    if (this.state.relationNameIsBreakingChange) {
      messages.push(relationNameIsBreakingChangeMessage)
    }

    const cardinalityIsBreakingChangeMessage = 'The cardinality of the relation was changed to ' +
      this.readableCardinalityString(this.state.selectedCardinality) + '\' (was \'' +
      this.readableCardinalityString(this.cardinalityFromRelation(this.props.viewer.relation)) + '\' before).'
    if (this.state.cardinalityIsBreakingChange) {
      messages.push(cardinalityIsBreakingChangeMessage)
    }

    // left field name
    const leftInputIsBreakingChangeMessage = 'The field on the left model (' + this.state.leftSelectedModel.name +
      ') was renamed to \'' + this.state.fieldOnLeftModelName + '\' (was \'' +
      this.props.viewer.relation.fieldOnLeftModel.name + '\' before).'
    if (this.state.leftInputIsBreakingChange) {
      messages.push(leftInputIsBreakingChangeMessage)
    }

    // right field name
    const rightInputIsBreakingChangeMessage = 'The field on the right model (' + this.state.rightSelectedModel.name +
      ') was renamed to \'' + this.state.fieldOnRightModelName + '\' (was \'' +
      this.props.viewer.relation.fieldOnRightModel.name + '\' before).'
    if (this.state.rightInputIsBreakingChange) {
      messages.push(rightInputIsBreakingChangeMessage)
    }

    // left model
    const leftModelIsBreakingChangeMessage = 'The left model was changed to \'' + this.state.leftSelectedModel.name +
      '\' (was \'' + this.props.viewer.relation.leftModel.name + '\' before).'
    if (this.state.leftModelIsBreakingChange) {
      messages.push(leftModelIsBreakingChangeMessage)
    }

    // right model
    const rightModelIsBreakingChangeMessage = 'The right model was changed to \'' + this.state.rightSelectedModel.name +
      '\' (was \'' + this.props.viewer.relation.rightModel.name + '\' before).'
    if (this.state.rightModelIsBreakingChange) {
      messages.push(rightModelIsBreakingChangeMessage)
    }

    return messages
  }

  private readableCardinalityString = (cardinality: Cardinality): string => {
    switch (cardinality) {
      case 'ONE_TO_ONE': return 'One-To-One'
      case 'ONE_TO_MANY': return 'One-To-Many'
      case 'MANY_TO_ONE': return 'Many-To-One'
      case 'MANY_TO_MANY': return 'Many-To-Many'
    }
  }

  private resetToInitialState = () => {
    const {relation} = this.props.viewer
    this.setState({
      leftSelectedModel: relation ? relation.leftModel : null,
      rightSelectedModel: relation ? relation.rightModel : null,
      selectedCardinality: relation ?
        this.cardinalityFromRelation(relation) : 'ONE_TO_ONE' as Cardinality,
      relationName: relation ? relation.name : '',
      relationDescription: relation ? relation.description : '',
      fieldOnLeftModelName: relation ? relation.fieldOnLeftModel.name : null,
      fieldOnRightModelName: relation ? relation.fieldOnRightModel.name : null,
      leftInputIsBreakingChange: false,
      rightInputIsBreakingChange: false,
      relationNameIsBreakingChange: false,
      leftModelIsBreakingChange: false,
      rightModelIsBreakingChange: false,
      cardinalityIsBreakingChange: false,
    } as State)
  }

  private addRelation = () => {

    const leftField = this.state.fieldOnLeftModelName
    const rightField = this.state.fieldOnRightModelName

    this.setState({loading: true} as State)
    Relay.Store.commitUpdate(
      new AddRelationMutation({
        projectId: this.props.viewer.project.id,
        name: this.state.relationName,
        description: this.state.relationDescription === '' ? null : this.state.relationDescription,
        leftModelId: this.state.leftSelectedModel.id,
        rightModelId: this.state.rightSelectedModel.id,
        fieldOnLeftModelName: leftField,
        fieldOnRightModelName: rightField,
        fieldOnLeftModelIsList: this.state.selectedCardinality.endsWith('MANY'),
        fieldOnRightModelIsList: this.state.selectedCardinality.startsWith('MANY'),
        fieldOnLeftModelIsRequired: this.state.fieldOnLeftModelIsRequired,
        fieldOnRightModelIsRequired: this.state.fieldOnRightModelIsRequired,
      }),
      {
        onSuccess: () => {
          this.close()
        },
        onFailure: (transaction: Transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
          this.setState({loading: false} as State)
        },
      },
    )
  }

  private editRelation = () => {

    const leftField = this.state.fieldOnLeftModelName
    const rightField = this.state.fieldOnRightModelName

    this.setState({loading: true} as State)
    Relay.Store.commitUpdate(
      new UpdateRelationMutation({
        relationId: this.props.viewer.relation.id,
        name: this.state.relationName,
        description: this.state.relationDescription === '' ? null : this.state.relationDescription,
        leftModelId: this.state.leftSelectedModel.id,
        rightModelId: this.state.rightSelectedModel.id,
        fieldOnLeftModelName: leftField,
        fieldOnRightModelName: rightField,
        fieldOnLeftModelIsList: this.state.selectedCardinality.endsWith('MANY'),
        fieldOnRightModelIsList: this.state.selectedCardinality.startsWith('MANY'),
        fieldOnLeftModelIsRequired: this.state.fieldOnLeftModelIsRequired,
        fieldOnRightModelIsRequired: this.state.fieldOnRightModelIsRequired,
      }),
      {
        onSuccess: () => {
          // The force fetching because relations are too complicated to selective choose the config
          this.props.relay.forceFetch()
          this.close()
        },
        onFailure: (transaction: Transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
          this.setState({loading: false} as State)
        },
      },
    )
  }

  private deleteRelation = () => {
    this.setState({loading: true} as State)
    Relay.Store.commitUpdate(
      new DeleteRelationMutation({
        relationId: this.props.viewer.relation.id,
        projectId: this.props.viewer.project.id,
        leftModelId: this.props.viewer.relation.leftModel.id,
        rightModelId: this.props.viewer.relation.leftModel.id,
      }),
      {
        onSuccess: () => {
          this.close()
        },
        onFailure: (transaction: Transaction) => {
          onFailureShowNotification(transaction, this.props.showNotification)
          this.setState({loading: false} as State)
        },
      },
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({showNotification}, dispatch)
}

const mappedCreateRelationPopup = connect(null, mapDispatchToProps)(RelationPopup)

export default Relay.createContainer(withRouter(mappedCreateRelationPopup), {
  initialVariables: {
    projectName: null, // injected from router
    relationName: null, // injected from router
    relationExists: false,
  },
  prepareVariables: (prevVariables: any) => (Object.assign({}, prevVariables, {
    relationExists: !!prevVariables.relationName,
  })),
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        relation: relationByName(
        projectName: $projectName
        relationName: $relationName
        ) @include(if: $relationExists) {
          id
          name
          description
          fieldOnLeftModel {
            id
            name
            isList
            isRequired
          }
          fieldOnRightModel {
            id
            name
            isList
            isRequired
          }
          leftModel {
            id
            name
            namePlural
            itemCount
          }
          rightModel {
            id
            name
            namePlural
            itemCount
          }
        }
        user {
          crm {
            information {
              isBeta
            }
          }
        }
        project: projectByName(projectName: $projectName) {
          id
          relations(first: 1000) {
            edges {
              node {
                name
              }
            }
          }
          models(first: 1000) {
            edges {
              node {
                id
                name
                namePlural
                fields(first: 1000) {
                  edges {
                    node {
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
