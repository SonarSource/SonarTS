import * as React from 'react'
import OptionInput from './OptionInput'
import {Constraint} from '../../../types/types'
import {$v, Icon} from 'graphcool-styles'

interface Props {
  style?: any
  isUnique: boolean
  onToggleIsUnique: () => void
  constraints: Constraint[]
  onAddConstraint: (type: ConstraintType) => void
  onRemoveConstraint: (index: number) => void
  onEditConstraint: (index: number, value: string) => void
}

interface State {
  selectorVisible: boolean
}

export default class Constraints extends React.Component<Props,State> {
  private selectorButton: HTMLDivElement

  constructor(props) {
    super(props)

    this.state = {
      selectorVisible: false,
    }
  }

  componentDidMount() {
    document.addEventListener('click', this.onClick)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onClick)
  }

  onClick = (e: any) => {
    // will be closed, no matter where you click
    if (e.target !== this.selectorButton) {
      // make sure, react gets the click first
      setImmediate(() => {
        this.setState({
          selectorVisible: false,
        } as State)
      })
    }
  }

  render() {
    const {
      style,
      isUnique,
      onToggleIsUnique,
      constraints,
      onAddConstraint,
      onRemoveConstraint,
      onEditConstraint,
    } = this.props
    const {selectorVisible} = this.state

    return (
      <div style={style} className='constraints'>
        <style jsx>{`
          .constraints {
            @p: .w100, .pb38, .bbox;
          }
          .is-unique {
            @p: .ph38, .flex, .itemsCenter, .justifyBetween;
            height: 34px;
          }
          .constraint-badge {
            @p: .f14, .fw6, .ba, .bBlack30, .black30, .br2, .ttu;
            padding: 5px 9.86px 6px 9.14px;
          }
          .type-constraints-title-wrapper {
            @p: .bb, .bBlack10, .flex, .justifyBetween, .mb38, .w100, .mt16, .pt4;
          }
          .type-constraints-title {
            @p: .bgWhite, .ph10, .black50, .flex, .relative, .itemsCenter, .ml25;
            bottom: -18px;
          }
          .type-constraints-text {
            @p: .f16, .mr10;
          }
          .type {
            @p: .bgBlack04, .br2, .f12, .fw6;
            font-family: Source Code Pro,Consolas,Inconsolata,Droid Sans Mono,Monaco,monospace;
            padding: 3px 5px 4px 5px;
          }
          .button-add-constraint {
            @p: .f14, .black50, .fw6, .ttu, .buttonShadow, .mr25, .relative, .bgWhite, .pointer;
            padding: 7px 10px;
            letter-spacing: 0.52px;
            bottom: -18px;
          }
          .intro {
            @p: .w100, .flex, .itemsCenter, .justifyCenter, .bbox, .pt10;
            padding-left: 77px;
            padding-right: 77px;
          }
          .intro-text {
            @p: .black30, .f16, .tc;
          }

          .constraint {
            @p: .pv16, .flex, .itemsCenter, .mh25, .justifyBetween, .ph16;
            flex-direction: row-reverse;
          }

          .symbol, .name {
            @p: .black30, .f14;
          }

          .symbol {
            @p: .fw7, .tc, .flex, .itemsCenter, .justifyCenter;
            width: 23px;
          }

          .name {
            @p: .fw6, .ml10, .ttu;
            width: 95px;
          }

          .constraint + .constraint {
            @p: .bt, .bBlack05;
            border-top: 1px
          }

          .constraint-input {
            @p: .f20, .black50, .fw6;
            flex: 0 1 300px;
          }

          .constraint-meta {
            @p: .flex, .itemsCenter;
          }

          .constraint-input::placeholder {
            color: rgba(74,144,226,.3);
          }

          .remove {
            @p: .pointer;
            width: 16px;
          }

          .remove-icon {
            @p: .dn;
          }

          .constraint:hover .remove-icon {
            @p: .db;
          }

          .add-constraint {
            @p: .relative;
          }

          .add-constraint-selector {
            @p: .absolute, .bgWhite, .z2;
            box-shadow: 0 1px 7px rgba(0,0,0,.2);
            top: 10px;
            left: -2px;
          }

          .selector-item {
            @p: .flex, .itemsCenter, .pointer;
            padding: 12px 16px 13px 16px;
          }

          .selector-item:hover {
            @p: .bgBlue;
          }

          .selector-item + .selector-item {
            @p: .bt, .bBlack10;
          }

          .selector-item:hover .name, .selector-item:hover .symbol {
            @p: .white;
          }
        `}</style>
        <style jsx={true} global>{`
          .selector-item:hover .symbol svg {
            fill: white;
          }

          .constraint-input:focus,
          .constraint-input:focus ~ .constraint-meta .name,
          .constraint-input:focus ~ .constraint-meta .symbol,
          .constraint-input:focus ~ .constraint-meta .symbol svg {
            color: $blue !important;
            fill: $blue !important;
          }
        `}</style>
        <div className='is-unique'>
          <OptionInput
            checked={isUnique}
            label='This field is unique'
            onToggle={onToggleIsUnique}
            scale={1.2}
          />
          {isUnique && (
            <div className='constraint-badge'>Unique</div>
          )}
        </div>
        {/*
        <div className='type-constraints-title-wrapper'>
          <div className='type-constraints-title'>
            <div className='type-constraints-text'>Type Constraints for</div>
            <div className='type'>String</div>
          </div>
          <div className='add-constraint'>
            <div onClick={this.showSelector} className='button-add-constraint' ref={ref => this.selectorButton = ref}>
              Add Constraint
            </div>
            {selectorVisible && (
              <div className='add-constraint-selector'>
                {Object.keys(typeTextMap).map((type: ConstraintType) => (
                  <div className='selector-item' onClick={() => onAddConstraint(type)} key={type}>
                    <div className='symbol'>
                      {
                        typeSymbolMap[type].text ?
                          typeSymbolMap[type].text : (
                            <Icon
                              src={typeSymbolMap[type].icon}
                              width={typeSymbolMap[type].width || 17}
                              height={typeSymbolMap[type].height || 17}
                              color={$v.gray30}
                              className='selector-icon'
                            />
                          )
                      }
                    </div>
                    <div className='name'>
                      {typeTextMap[type]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {constraints.length === 0 && (
          <div className='intro'>
            <div className='intro-text'>
              With type constraints, you can define the shape of the data that’s allowed by your nodes.
            </div>
          </div>
        )}
        {constraints.length > 0 && (
          <div className='constraints-list'>
            {constraints.map((constraint, index) => {
              return (
                <div className='constraint' key={constraint.type}>
                  <div className='remove' onClick={() => onRemoveConstraint(index)}>
                    <div className='remove-icon'>
                      <Icon
                        src={require('graphcool-styles/icons/stroke/cross.svg')}
                        stroke
                        strokeWidth={3}
                        color='rgba(0,0,0,.25)'
                        width={16}
                        height={16}
                      />
                    </div>
                  </div>
                  <input
                    className='constraint-input'
                    type='text'
                    placeholder='type something ...'
                    value={constraint.value}
                    onChange={(e: any) => onEditConstraint(index, e.target.value)}
                    autoFocus={constraint.value === ''}
                  />
                  <div className='constraint-meta'>
                    <div className='symbol'>
                      {
                        typeSymbolMap[constraint.type].text ?
                          typeSymbolMap[constraint.type].text : (
                            <Icon
                              src={typeSymbolMap[constraint.type].icon}
                              width={typeSymbolMap[constraint.type].width || 17}
                              height={typeSymbolMap[constraint.type].height || 17}
                              color={$v.gray30}
                            />
                          )
                      }
                    </div>
                    <div className='name'>{typeTextMap[constraint.type]}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        */}
      </div>
    )
  }

  private showSelector = () => {
    this.setState({
      selectorVisible: true,
    } as State)
  }

  private hideSelector = () => {
    this.setState({
      selectorVisible: false,
    } as State)
  }
}

export type ConstraintType = 'REGEX' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'EQUALS' | 'LENGTH'

interface SymbolMap {
  text?: string
  icon?: string
  width?: number
  height?: number
}

interface TypeSymbolMap {
  [key: string]: SymbolMap
}

const typeSymbolMap: TypeSymbolMap = {
  'REGEX': {
    text: '(.*)',
  },
  'CONTAINS': {
    text: '..|..',
  },
  'STARTS_WITH': {
    text: '|…',
  },
  'ENDS_WITH': {
    text: '…|',
  },
  'EQUALS': {
    icon: require('../../../assets/icons/equals.svg'),
    width: 11,
    height: 11,
  },
  'LENGTH': {
    icon: require('../../../assets/icons/length.svg'),
    width: 17,
    height: 17,
  },
}

const typeTextMap = {
  'REGEX': 'Regex',
  'CONTAINS': 'Contains',
  'STARTS_WITH': 'Starts With',
  'ENDS_WITH': 'Ends With',
  'EQUALS': 'Equals',
  'LENGTH': 'Length',
}

const operatorTextMap = {
  'GT': '>',
  'GTE': '>=',
  'LT': '<',
  'LTE': '<=',
  'EQ': '=',
}
