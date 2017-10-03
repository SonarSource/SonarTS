import * as React from 'react'
import {$p, variables} from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'

interface Props {
  defaultChecked: boolean
  onChange?: (e: any) => void
  style?: any
  className?: string
}

const Container = styled.label`
  width: 39px;
  height: 21px;
`

const Slider = styled.div`
  transition: .4s;
  border-radius: 23px;
  &:before {
    position: absolute;
    content: "";
    height: 23px;
    width: 23px;
    left: -1px;
    bottom: -1px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,.25);
  }
`

const ToggleInput = styled.input`
  &:checked + div {
    background-color: ${variables.green};
  }
  
  &:checked + div:before {
    transform: translateX(19px);
  }
`

export default class NewToggleButton extends React.Component<Props, {}> {
  render() {
    return (
      <Container
        className={cx(
          $p.relative,
          $p.dib,
          this.props.className,
        )}
        style={this.props.style}
      >
        <ToggleInput
          type='checkbox'
          className={$p.dn}
          checked={this.props.defaultChecked}
          onChange={this.props.onChange}
        />
        <Slider className={cx(
          $p.absolute,
          $p.pointer,
          $p.top0,
          $p.left0,
          $p.right0,
          $p.bottom0,
          $p.bgBlack20,
        )}>

        </Slider>
      </Container>
    )
  }
}
