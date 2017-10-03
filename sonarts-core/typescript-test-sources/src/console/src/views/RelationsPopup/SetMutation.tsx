import * as React from 'react'
import {Cardinality, Model} from '../../types/types'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import MutationsInfoBox from './MutationsInfoBox'
import {validateRelationName} from '../../utils/nameValidator'
import {ENTER_KEY, ESCAPE_KEY} from '../../utils/constants'
import Tooltip from '../../views/Tooltip/Tooltip'

interface State {
  isEnteringRelationName: boolean
  isHoveringRelationName: boolean
  isEnteringRelationDescription: boolean
  isHoveringRelationDescription: boolean
  savedRelationName: string
  savedRelationDescription: string
}

interface Props {
  relationName: string
  relationDescription?: string
  onChangeRelationNameInput: Function
  onChangeRelationDescriptionInput: Function
  leftSelectedModel: Model | null
  rightSelectedModel: Model | null
  selectedCardinality: Cardinality | null
  fieldOnLeftModelName: string | null
  fieldOnRightModelName: string | null
  relationNameIsBreakingChange: boolean
  isEditingExistingRelation: boolean
}

export default class SetMutation extends React.Component<Props, State> {

  constructor(props) {
    super(props)
    this.state = {
      isEnteringRelationName: true,
      isHoveringRelationName: false,
      isEnteringRelationDescription: false,
      isHoveringRelationDescription: false,
      savedRelationName: props.relationName,
      savedRelationDescription: props.relationDescription,
    }

  }

  render() {

    const {isEnteringRelationName, isEnteringRelationDescription} = this.state
    const {relationName, relationDescription} = this.props

    return (
      <div className='container'>
        <style jsx={true}>{`

          .container {
            @inherit: .ph16, .pt38, .bgWhite;
          }

          .descriptionInputField {
            @inherit: .f16, .w100, .ph25;
            color: rgba(42,127,211,1);
          }

          .relationNameHeight {
            height: 58px;
          }

          .relationDescriptionHeight {
            height: 58px;
          }

          input {
            line-height: 1.5;
          }

        `}</style>
        {isEnteringRelationName || relationName.length === 0 ?
          (
            <div className='flex itemsCenter justifyBetween pr38 relationNameHeight'>
              <div className='w100'>
                {this.generateRelationNameInputComponent()}
              </div>
            </div>
          )
          :
          (
            <div
              className='flex itemsCenter pointer relationNameHeight'
              onMouseEnter={() => this.setState({isHoveringRelationName: true} as State)}
              onMouseLeave={() => this.setState({isHoveringRelationName: false} as State)}
              onClick={() => this.setState({
                    isEnteringRelationName: true,
                    isHoveringRelationName: false,
                  } as State)}
            >
              <div className='ph25 f38 fw3 black80'>{relationName}</div>
              {this.state.isHoveringRelationName && (<Icon
                className='ml6'
                src={require('../../assets/icons/edit_project_name.svg')}
                width={20}
                height={20}
              />)}
            </div>
          )
        }
        {isEnteringRelationDescription ?
          (
            <div className='flex itemsCenter mv25 relationDescriptionHeight'>
              <input
                className='descriptionInputField ph25'
                autoFocus={true}
                placeholder='Write a short description for the relation...'
                value={relationDescription}
                onKeyDown={this.handleKeyDownOnRelationDescription}
                onBlur={() => this.setState({
                    isEnteringRelationDescription: false,
                  } as State)}
                onChange={(e: any) =>
                  this.props.onChangeRelationDescriptionInput(e.target.value)
                }
                onFocus={() =>
                  this.setState({
                    isEnteringRelationName: false,
                  } as State)
                }
              />
            </div>
          )
          :
          (relationDescription === null || relationDescription.length === 0) && (
            <div
              className='flex itemsCenter mv25 ph25 pointer relationDescriptionHeight'
              onClick={() => this.setState({
                isEnteringRelationDescription: true,
              } as State)}
            >
              <Icon
                src={require('../../assets/icons/edit_circle_gray.svg')}
                width={26}
                height={26}
              />
              <div className='f16 black40 ml16'>
                add description
                <span className='black30'> (optional)</span>
              </div>
            </div>
          ) ||
          relationDescription.length > 0 && (
            <div
              className='flex itemsCenter pointer'
              onMouseEnter={() => this.setState({isHoveringRelationDescription: true} as State)}
              onMouseLeave={() => this.setState({isHoveringRelationDescription: false} as State)}
              onClick={() => this.setState({
                    isEnteringRelationDescription: true,
                    isHoveringRelationDescription: false,
                  } as State)}
            >
              <div className='f16 black50 mv25 pl25 pr6'>{relationDescription}</div>
              {this.state.isHoveringRelationDescription && (<Icon
                className='ml6'
                src={require('../../assets/icons/edit_project_name.svg')}
                width={20}
                height={20}
              />)}
            </div>
          )
        }
        {this.props.leftSelectedModel && this.props.rightSelectedModel &&
        <MutationsInfoBox
          selectedCardinality={this.props.selectedCardinality}
          relationName={this.props.relationName}
          leftSelectedModel={this.props.leftSelectedModel}
          rightSelectedModel={this.props.rightSelectedModel}
          fieldOnLeftModelName={this.props.fieldOnLeftModelName}
          fieldOnRightModelName={this.props.fieldOnRightModelName}
        />
        }
      </div>
    )
  }

  private handleKeyDownOnRelationName = (e) => {
    if (e.keyCode === ENTER_KEY) {
      const newRelationName = validateRelationName(this.props.relationName) ?
        this.props.relationName : this.state.savedRelationName
      this.setState(
        {
          isEnteringRelationName: false,
          savedRelationName: newRelationName,
        } as State,
        () => {
          this.props.onChangeRelationNameInput(newRelationName)
        })
    } else if (e.keyCode === ESCAPE_KEY) {
      this.setState({
        isEnteringRelationName: false,
      } as State)
      this.props.onChangeRelationNameInput(this.state.savedRelationName)
    }
  }

  private handleKeyDownOnRelationDescription = (e) => {
    if (e.keyCode === ENTER_KEY) {
      this.setState({
        isEnteringRelationDescription: false,
        savedRelationDescription: this.props.relationDescription,
      } as State)
    } else if (e.keyCode === ESCAPE_KEY) {
      this.setState({
        isEnteringRelationDescription: false,
      } as State)
      this.props.onChangeRelationDescriptionInput(this.state.savedRelationDescription)
    }
  }

  private generateRelationNameInputComponent = (): JSX.Element => {
    const {relationName} = this.props

    return relationName.length > 0 && !validateRelationName(relationName) ? (

        <div className='flex justifyBetween itemsCenter w100'>
          <style jsx={true}>{`
            input {
              line-height: 1.5;
            }
          `}</style>
          <input
            className={`f38 fw3 w100 ph25
                        ${relationName.length === 0 || validateRelationName(relationName) ? 'blue' : 'red'}`}
            autoFocus={true}
            placeholder='Set a name for the relation...'
            value={relationName}
            onKeyDown={this.handleKeyDownOnRelationName}
            onBlur={() => this.setState({
                isEnteringRelationName: false,
              } as State)}
            onChange={(e: any) => {
              this.props.onChangeRelationNameInput(e.target.value)
              this.setState(
                {
                  isEnteringRelationName: true,
                } as State,
              )
            }}
            onFocus={() =>
              this.setState({
                isEnteringRelationDescription: false,
              } as State)
              }
          />
          <Tooltip
            className='red'
            text='Relation name has to be capitalized and must only contain alphanumeric characters.'
          >
            <Icon
              className='pointer'
              src={require('../../assets/icons/warning_red.svg')}
              width={25}
              height={25}
            />
          </Tooltip>
        </div>
      ) : (
        <input
          className={`f38 fw3 w100 ph25
                    ${relationName.length === 0 || validateRelationName(relationName) ? 'blue' : 'red'}`}
          autoFocus={true}
          placeholder='Set a name for the relation...'
          value={relationName}
          onKeyDown={this.handleKeyDownOnRelationName}
          onBlur={() => this.setState({
            isEnteringRelationName: false,
            } as State)
          }
          onChange={(e: any) => {
          this.props.onChangeRelationNameInput(e.target.value)
          this.setState(
            {
              isEnteringRelationName: true,
            } as State,
          )
        }}
          onFocus={() =>
          this.setState({
            isEnteringRelationDescription: false,
          } as State)
          }
        />
      )
  }

}

/*

 */
