import * as React from 'react'
import {Icon} from 'graphcool-styles'
import {validateFieldName} from '../../utils/nameValidator'
import Tooltip from '../../views/Tooltip/Tooltip'

interface State {
  isHovered: boolean
  isEnteringFieldName: boolean
  originalFieldName: string
}

interface Props {
  relatedFieldName: string | null
  relatedFieldType: string | null
  didChangeFieldName: (newFieldName: string) => void
  forbiddenFieldNames: string[]
}

export default class FieldNameInput extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      isHovered: false,
      isEnteringFieldName: false,
      originalFieldName: props.relatedFieldName,
    }
  }

  render() {

    const invalidInputMessage: string | null = this.generateInvalidInputMessage(this.props.relatedFieldName)
    const shouldBreak = this.props.relatedFieldName ? this.props.relatedFieldName.length > 12 : false

    let relatedFieldElement: JSX.Element
    if (this.props.relatedFieldName !== null && this.props.relatedFieldType) {
      relatedFieldElement = (
        <div
          className={`ph16 pv8 flex pointer
            ${!shouldBreak ? 'itemsCenter ' : 'flexColumn'}
            ${!this.state.isHovered && !this.state.isEnteringFieldName && ' marginRight'}
            ${this.state.isHovered && ' bgBlack02'}
            ${this.state.isEnteringFieldName && ' justifyBetween'}`}
          onMouseEnter={() => this.setState({isHovered: true} as State)}
          onMouseLeave={() => this.setState({isHovered: false} as State)}
          onClick={() => this.setState({isEnteringFieldName: true} as State)}
        >
          <style jsx={true}>{`

            .fieldType {
              @inherit: .f14, .pv4, .ph6, .black50, .bgBlack04, .br2;
              font-family: 'Source Code Pro';
            }

            .purpleColor {
              color: rgba(164,3,111,1);
            }

            .move {
              transition: .5s linear all;
            }

            .marginRight {
              margin-right: 24px;
            }

          `}</style>
          {!this.state.isEnteringFieldName && !this.state.isHovered &&
          (<div className={`f20 purpleColor`}>
            {this.props.relatedFieldName}
          </div>
          )}
          {!this.state.isEnteringFieldName && this.state.isHovered &&
          (<div className='flex itemsCenter '>
              <div className='f20 purpleColor'>{this.props.relatedFieldName}</div>
              <Icon
                className='mh4 move'
                src={require('../../assets/icons/edit_project_name.svg')}
                width={16}
                height={16}
              />
            </div>
          )}
          {this.state.isEnteringFieldName &&
          (

            <div className='flex itemsCenter'>
              {Boolean(invalidInputMessage) &&
              <Tooltip
                className='red'
                text={invalidInputMessage}
              >
                <Icon
                  className='mr6'
                  src={require('../../assets/icons/warning_red.svg')}
                  width={22}
                  height={22}
                />
              </Tooltip>}
              <input
                type='text'
                autoFocus={true}
                onBlur={() => {
                  this.doneEditingInputField(false)
                }}
                className={`f20 bgTransparent wS96
                ${Boolean(invalidInputMessage) ? ' red' : ' purpleColor'}`}
                onKeyDown={this.handleKeyDown}
                value={this.props.relatedFieldName}
                onChange={(e: any) => {
                  this.props.didChangeFieldName(e.target.value)
                }}
              />
            </div>
          )}
          <div className={`move fieldType ${!shouldBreak ? 'ml6' : ''}`}>
            {this.props.relatedFieldType}
          </div>
        </div>
      )
    } else {
      relatedFieldElement = (
        <div
          className='ph16 pv8 black20 f20 i pointer'
          onMouseEnter={() => this.setState({isHovered: true} as State)}
          onMouseLeave={() => this.setState({isHovered: false} as State)}
          onClick={() => this.setState({isEnteringFieldName: true} as State)}
        >
          will be generated
        </div>
      )
    }

    return (
      <div
        className='bgWhite br2'
      >
        <div
          className='black40 f14 pl16 pv8'
        >
          related field:
        </div>
        {relatedFieldElement}
      </div>
    )
  }

  private handleKeyDown = (e) => {
    if (e.keyCode === 13 || e.keyCode === 27) {
      this.doneEditingInputField(e.keyCode === 27)
    }
  }

  private doneEditingInputField = (reset: boolean) => {
    const {relatedFieldName} = this.props
    const {originalFieldName} = this.state
    const actualRelatedFieldName =
      relatedFieldName.length === 0 || reset || this.generateInvalidInputMessage(relatedFieldName) ?
        originalFieldName : relatedFieldName
    this.props.didChangeFieldName(actualRelatedFieldName)
    this.setState({
      isEnteringFieldName: false,
    } as State)
  }

  private generateInvalidInputMessage = (input: string): string | null => {
    if (!input || input.length === 0) {
      return null
    }

    if (!validateFieldName(input)) {
      return 'Field names have to start with a lowercase letter and must only contain alphanumeric characters.'
    }

    if (this.props.forbiddenFieldNames.includes(input)) {
      return 'Field with name \'' + input + '\' already exists in this project.'
    }
    return null
  }
}
