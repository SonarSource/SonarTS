import * as React from 'react'
const classes: any = require('./ScrollBox.scss')

interface Props {
  children?: React.ReactChild
  innerContainerClassName?: string
  outerContainerClassName?: string
  onScroll?: (e: React.UIEvent<any>) => void
  style?: any
}

let scrollBarWidth = null

export default class ScrollBox extends React.Component<Props, {}> {

  refs: {
    [key: string]: any;
    outerContainer: Element
    innerContainer: Element
  }

  componentWillMount () {
    if (scrollBarWidth === null) {
      const scrollDiv = document.createElement('div')
      scrollDiv.className = classes.measureElement
      document.body.appendChild(scrollDiv)

      scrollBarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth

      document.body.removeChild(scrollDiv)
    }
  }

  _onScroll (e: React.UIEvent<any>) {
    if (e.target === this.refs.outerContainer) {
      this.props.onScroll(e)
    }
  }

  render () {
    const onScroll = this.props.onScroll ? this._onScroll.bind(this) : (() => undefined)
    const {style} = this.props
    return (
      <div className={classes.rootContainer} style={style}>
        <div
          className={`${classes.outerContainer} ${this.props.outerContainerClassName || ''}`}
          style={{width: `calc(100% + ${scrollBarWidth}px)`}}
          onScroll={onScroll}
          ref='outerContainer'
        >
          <div
            className={`${classes.innerContainer} ${this.props.innerContainerClassName || ''}`}
            ref='innerContainer'
          >
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}
