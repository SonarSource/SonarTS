import * as React from 'react'
import * as cx from 'classnames'
import { $p, $v, $g } from 'graphcool-styles'
import styled from 'styled-components'

const Overlay = styled.span`
  top: 30px;
  width: 350px;
  white-space: initial;
  overflow: visible;
  font-size: ${$v.size12};
  padding: ${$v.size10};
  
  &:before {
    content: "";
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translate(-50%,0);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 6px 6px 6px;
    border-color: transparent transparent ${$v.white} transparent;
  }
  
  @media (min-width: 750px) {
    font-size: ${$v.size14};
    padding: ${$v.size16};
  }
`

interface Props {
  text: string
  children?: JSX.Element
  className?: string
}

interface State {
  showOverlay: boolean
}

export default class Hint extends React.Component<Props, State> {

  state: State = {
    showOverlay: false,
  }

  render() {

    return (
      <div
        className={cx($p.relative, this.props.className, $p.dib)}
        onMouseEnter={() => this.setState({showOverlay: true} as State)}
        onMouseLeave={() => this.setState({showOverlay: false} as State)}
        onClick={() => this.setState({showOverlay: !this.state.showOverlay} as State)}
      >
        {this.props.children}
        {this.state.showOverlay &&
        <Overlay className={cx($g.overlay, $p.absolute, $p.fw4, $p.left50, $p.tlHCenter, $p.tc)}>
          {this.props.text}
        </Overlay>
        }
      </div>
    )
  }
}
