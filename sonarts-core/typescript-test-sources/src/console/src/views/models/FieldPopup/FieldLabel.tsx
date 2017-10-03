import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import {FieldPopupErrors} from './FieldPopupState'
import ErrorInfo from './ErrorInfo'
import Tether from '../../../components/Tether/Tether'

interface State {
  isHoveringName: boolean
  isEnteringDescription: boolean
  isHoveringDescription: boolean
}

interface Props {
  name: string
  description?: string
  onChangeName: Function
  onChangeDescription: Function
  errors: FieldPopupErrors
  showErrors: boolean
}

export default class FieldLabel extends React.Component<Props, State> {

  state = {
    isHoveringName: false,
    isEnteringDescription: false,
    isHoveringDescription: false,
  }

  render() {

    const {isEnteringDescription} = this.state
    const {name, description, errors, showErrors} = this.props

    return (
      <div className='container'>
        <style jsx={true}>{`

          .container {
            @p: .ph16, .bgWhite;
          }

          .fieldNameInputField {
            @p: .f38, .fw3, .w100, .ph25;
            color: rgba(42,127,211,1);
          }

          .fieldNameInputField.error {
            color: $red;
          }

          .descriptionInputField {
            @p: .f16, .w100, .ph25;
            color: rgba(42,127,211,1);
          }

          .edit-name {
            height: 54px;
          }

          .edit-description {
            height: 26px;
          }

          .edit-name-value {
            top: 1px;
          }

          input {
            line-height: 1.5;
          }

        `}</style>
            <div className='flex itemsCenter pr38 edit-name'>
              <Tether
                steps={[
                  {
                    step: 'STEP2_ENTER_FIELD_NAME_IMAGEURL',
                    title: 'Call the field "imageUrl"',
                    description: 'Field names always start lower case.',
                  },
                  {
                    step: 'STEP2_ENTER_FIELD_NAME_DESCRIPTION',
                    title: 'Call the field "description"',
                    description: 'Field names always start lower case.',
                  },
                ]}
                offsetX={5}
                offsetY={5}
                width={270}
              >
                <input
                  className={'enter-event fieldNameInputField' + ((errors.invalidName && showErrors) ? ' error' : '')}
                  autoFocus={true}
                  placeholder='Select a name ...'
                  value={name}
                  onChange={(e: any) => {
                    this.props.onChangeName(e.target.value)
                  }}
                  onFocus={() =>
                    this.setState({
                      isEnteringDescription: false,
                    } as State)
                  }
                />
              </Tether>
              <div className='flex itemsCenter'>
                {errors.invalidName && showErrors && (
                  <ErrorInfo>
                    The fieldname must start with a lowercase letter and should only have alphanumeric characters.
                  </ErrorInfo>
                )}
              </div>
            </div>
        {isEnteringDescription ?
          (
            <div className='flex itemsCenter mv25 bbox edit-description'>
              <input
                className='descriptionInputField ph25'
                autoFocus={true}
                placeholder='Write a short description for the field...'
                value={description}
                onKeyDown={this.handleKeyDownOnFieldDescription}
                onChange={(e: any) =>
                  this.props.onChangeDescription(e.target.value)
                }
              />
            </div>
          )
          :
          (!description || description.length === 0) && (
            <div
              className='flex itemsCenter mv25 ph25 pointer bbox edit-description'
              onClick={() => this.setState({
                isEnteringDescription: true,
              } as State)}
            >
              <div className='f16 black40'>
                <span className='underline'>add description</span>
                <span className='black30'> (optional)</span>
              </div>
            </div>
          ) ||
          (description && description.length > 0) && (
            <div
              className='flex itemsCenter pointer mv25 pl25 bbox edit-description '
              onMouseEnter={() => this.setState({isHoveringDescription: true} as State)}
              onMouseLeave={() => this.setState({isHoveringDescription: false} as State)}
              onClick={() => this.setState({
                isEnteringDescription: true,
                isHoveringDescription: false,
              } as State)}
            >
              <div className='f16 black50 pr6'>{description}</div>
              {this.state.isHoveringDescription && (
                <Icon
                  className='ml6'
                  src={require('../../../assets/icons/edit_project_name.svg')}
                  width={20}
                  height={20}
                />
              )}
            </div>
          )
        }
      </div>
    )
  }

  private handleKeyDownOnFieldDescription = (e) => {
    if (e.keyCode === 13) {
      this.setState({
        isEnteringDescription: false,
      } as State)
    } else if (e.keyCode === 27) {
      this.setState({
        isEnteringDescription: false,
      } as State)
    }
  }

}
