import * as React from 'react'
import * as cx from 'classnames'
import {$p} from 'graphcool-styles'
import styled from 'styled-components'

interface Props {
}

interface State {
  activeIndex: number
  count: number
}

const Dot = styled.div`
  width: 10px;
  height: 10px;
`

export default class Steps extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      activeIndex: 0,
      count: React.Children.count(this.props.children),
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyDown = (e: any) => {
    if (e.target instanceof HTMLInputElement) {
      return
    }

    if (e.keyCode === 37) {
      return this.prev()
    }

    if (e.keyCode === 39) {
      return this.next()
    }
  }

  render() {
    const {activeIndex} = this.state
    return (
      <div className={cx($p.overflowHidden, $p.flex, $p.flexRow, $p.relative)}>
        {React.Children.map(this.props.children, (child, i) => (
          <div
            className={cx($p.flexSlide, $p.relative)}
            style={{
              transition: '0.5s transform',
              transform: `translateX(${(-activeIndex) * 100}%)`,
            }}
          >
            {child}
          </div>
        ))}
        <div className={cx($p.absolute, $p.flex, $p.flexRow, $p.justifyCenter, $p.left0, $p.right0, $p.pt25)}>
          <div className={cx($p.flex, $p.flexRow, $p.justifyCenter)}>
            {React.Children.map(this.props.children, (child, i) => (
              <Dot
                className={cx(
                  $p.br100, $p.pointer,
                  {
                    [$p.ml10]: i !== 0,
                    [$p.bgGreen]: i === activeIndex,
                    [$p.bgGreen30]: i !== activeIndex,
                  },
                )}
                onClick={() => this.setIndex(i)}
              >
              </Dot>
            ))}
          </div>
        </div>
      </div>
    )
  }

  next = () => {
    const {activeIndex, count} = this.state
    this.setState({activeIndex: (activeIndex + 1) % count} as State)
  }

  prev = () => {
    const {activeIndex, count} = this.state
    // 2 * activeIndex, because 0 - 1 % n equals -1
    this.setState({activeIndex: (activeIndex + count - 1) % count} as State)
  }

  private setIndex(activeIndex: number) {
    this.setState({activeIndex} as State)
  }
}
