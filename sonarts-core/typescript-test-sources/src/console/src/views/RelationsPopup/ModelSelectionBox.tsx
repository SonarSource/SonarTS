import * as React from 'react'
import {Model} from '../../types/types'
import {Combobox} from 'react-input-enhancements'
import FieldNameInput from './FieldNameInput'
import BreakingChangeIndicator from './BreakingChangeIndicator'
import {$v} from 'graphcool-styles'
import FieldHorizontalSelect from '../models/FieldPopup/FieldHorizontalSelect'
import Info from '../../components/Info'

interface Props {
  relatedFieldName: string | null
  relatedFieldType: string | null
  many: boolean
  models: Model[]
  selectedModel?: Model
  didSelectedModel: Function
  didChangeFieldName: (newFieldName: string) => void
  inputIsBreakingChange: boolean
  modelIsBreakingChange: boolean
  forbiddenFieldNames: string[]
  isRequired: boolean
  didChangeIsRequired: (isRequired: boolean) => void
  isBeta: boolean
  singleCardinality: boolean
  // messagesForBreakingChange: string[]
}

interface State {
  modelName: string
}

export default class ModelSelectionBox extends React.Component<Props, State> {

  constructor(props) {
    super(props)
    this.state = {
      modelName: this.props.selectedModel && this.props.selectedModel.name || '',
    }
  }

  render() {

    const modelNames = this.props.models.map(model => model.name)

    let offsets: number[] = []
    let plain: boolean[] = []
    if (this.props.inputIsBreakingChange) {
      offsets.push(80)
      plain.push(true)
    }
    if (this.props.modelIsBreakingChange) {
      offsets.push(16)
      plain.push(true)
    }

    return (
      <div className={`model-selection-box ${this.props.many && 'topMargin20'}`}>
        <style jsx={true}>{`
          .model-selection-box :global(.required-relation-chooser) {
            @p: .dn;
          }
          .model-selection-box:hover :global(.required-relation-chooser) {
            @p: .flex;
          }
          .bottomBorder {
            border-bottom-style: solid;
            border-bottom-width: 1px;
            border-color: rgba(255,255,255,.2);
          }

          .negativeMargin {
            margin: -5px -5px -5px -5px;
            border-radius: 3px;
          }

          .model-selection-box :global(.dropdown) :global(svg) {
            transform: translate(-14px, -7px) !important;
            opacity: 1 !important;
          }
        `}</style>
        <style jsx global>{`
          .model-selection-box .dropdown>div:nth-child(3) {
            background: red !important;
            width: 100% !important;
            left: 0 !important;
          }
        `}</style>
        <div className='buttonShadow br2'>
          <BreakingChangeIndicator
            className='br2'
            indicatorStyle='RIGHT'
            width={16}
            height={12}
            offsets={offsets}
            plain={plain}
          >
            <div
              className={`flex itemsCenter justifyBetween pv8 ${this.props.selectedModel ? ' bgBlue' : ' bgBlue20'}`}
              style={{
                borderTopLeftRadius: '2px',
                borderTopRightRadius: '2px',
                width: 212,
              }}
            >
              <Combobox
                options={modelNames}
                value={this.state.modelName}
                onSelect={this.handleSelect}
                dropdownProps={{
                  className: `${this.props.selectedModel ? 'white' : 'blue' } f20 dropdown`,
                }}
                autocomplete
                autosize
              >
                {(inputProps) => (
                  <input
                    {...inputProps}
                    type='text'
                    className={`w100 ph16 f25 fw6 bgTransparent ${this.props.selectedModel ? 'white' : 'blue'}`}
                    placeholder='Select Model'
                  />
                )}
              </Combobox>
            </div>
            <FieldNameInput
              relatedFieldName={this.props.relatedFieldName}
              relatedFieldType={this.props.relatedFieldType}
              didChangeFieldName={this.props.didChangeFieldName}
              forbiddenFieldNames={this.props.forbiddenFieldNames}
            />
            {this.props.isBeta && (
              this.props.singleCardinality && (
                <FieldHorizontalSelect
                  activeBackgroundColor={$v.blue}
                  inactiveBackgroundColor='#F5F5F5'
                  choices={['required', 'optional']}
                  selectedIndex={this.props.isRequired ? 0 : 1}
                  inactiveTextColor={$v.gray30}
                  onChange={(index) => this.props.didChangeIsRequired([true, false][index])}
                  small
                  className='required-relation-chooser'
                />
              )
            )}
          </BreakingChangeIndicator>
        </div>
        {this.props.many &&
        <div
          className='flex flexColumn itemsCenter z1'
          style={{height: '20px', width: '100%'}}>
          <div
            className='bgWhite'
            style={{
              boxShadow: '0px 1px 3px rgba(0,0,0,.15)',
              width: '95%',
              height: '10px',
              borderBottomRightRadius: '2px',
              borderBottomLeftRadius: '2px',
              zIndex: 2,
            }}
          />
          <div
            className='bgWhite'
            style={{
              boxShadow: '0px 1px 3px rgba(0,0,0,.15)',
              width: '90%',
              height: '8px',
              borderBottomRightRadius: '2px',
              borderBottomLeftRadius: '2px',
              zIndex: 1,
            }}
          />
        </div>
        }
      </div>
    )
  }

  private handleSelect = (modelName) => {
    this.setState({modelName})
    this.didSelectModelWithName(modelName)
  }

  private didSelectModelWithName = (modelName: string) => {
    const model = this.props.models.find((model) => model.name === modelName)
    if (model) {
      this.props.didSelectedModel(model)
    }
  }

  private handleChange = e => {
    this.didSelectModelWithName(e.target.value)
    this.setState({modelName: e.target.value})
  }

}
