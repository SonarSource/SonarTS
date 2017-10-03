import * as React            from 'react' // tslint:disable-line
import {
  $p,
  variables,
  Icon,
}                            from 'graphcool-styles'
import styled                from 'styled-components'
import * as cx               from 'classnames'

const ConditionButton = styled.div`
  &:not(.${$p.bgBlue}):hover {
    background-color: ${variables.gray10};
  }
`

const CheckIcon = styled(Icon)`
  background-color: #4990E2;
  display: inline-flex !important;
  vertical-align: middle;
  padding: 5px;
  margin-right: 15px;
  border-radius: 50%;
`

const CheckIconDisabled = styled.div`
  background-color: ${variables.white};
  display: inline-flex !important;
  vertical-align: middle;
  padding: 12px;
  margin-right: 15px;
  border-radius: 50%;
  border: 1px solid black;
  opacity: 0.16;
`

const NestedCheckboxVerticalLine = styled.span`
  position: absolute;
  top: -25px;
  left: 0;
  height: 46px;
  border-left-width: 1px;
  border-left-style: solid;
`
const NestedCheckboxHorizontalLine = styled.span`
  position: absolute;
  width: 15px;
  height: 1px;
  top: 20px;
  left: 0;
  border-bottom-width: 1px;
  border-bottom-style: solid;
`

interface Props {
  label: string
  checked: boolean
  onClick?: () => void
  nested?: boolean
  forceHighlightVerticalLine?: boolean
}

export default (props: Props) => {
  const nestedLines = props.nested && ([
    <NestedCheckboxVerticalLine key={0} className={cx({
       [$p.bBlue]: props.checked || props.forceHighlightVerticalLine,
       [$p.bBlack20]: !props.checked,
    })}/>,
    <NestedCheckboxHorizontalLine key={1} className={cx({
       [$p.bBlue]: props.checked,
       [$p.bBlack20]: !props.checked,
    })}/>,
  ])

  const icon = props.checked
    ? <CheckIcon
        color='white'
        src={require('../../assets/icons/check.svg')}
      />
    : <CheckIconDisabled />

  return (
    <div
      className={cx($p.relative, $p.mv6, $p.pointer, {
        [$p.pl16]: props.nested,
        [$p.z2]: !props.nested,
      })}
      onClick={props.onClick}
     >
      { nestedLines }
      { icon }
      <span className={cx($p.dib, $p.vMid, {
        [$p.black30]: !props.checked,
      })}>
        { props.label }
      </span>
    </div>
  )
}
