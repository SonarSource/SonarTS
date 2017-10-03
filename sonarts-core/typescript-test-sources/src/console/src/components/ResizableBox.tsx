// @flow
import * as React from 'react'
const {PropTypes} = React
import {Resizable} from 'react-resizable'
import {Icon, $v} from 'graphcool-styles'

// An example use of Resizable.
export default class ResizableBox extends React.Component<any,any> {
  static propTypes = {
    height: PropTypes.any,
    width: PropTypes.number,
    hideArrow: PropTypes.bool,
  }

  static defaultProps = {
    handleSize: [20,20],
    hideArrow: false,
  }

  props: any
  state = {
    width: this.props.width,
    height: this.props.height,
  }

  onResize = (e: any, {element, size}: any) => {
    const {width, height} = size

    if (this.props.onResize) {
      if (typeof e.persist === 'function') {
        e.persist()
      }
      this.setState(size, () => this.props.onResize(e, {element, size}))
    } else {
      this.setState(size)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.width !== this.props.width || nextProps.height !== this.props.height) {
      this.setState({
        width: nextProps.width,
        height: nextProps.height,
      })
    }
  }

  render() {
    // Basic wrapper around a Resizable instance.
    // If you use Resizable directly, you are responsible for updating the child component
    // with a new width and height.
    const {handleSize, onResize, onResizeStart, onResizeStop, draggableOpts,
      minConstraints, maxConstraints, lockAspectRatio, axis, width, height, hideArrow, ...props} = this.props
    return (
      <div className='box'>
        <style jsx>{`
          .box {
            @p: .relative;
          }
          .resizer {
            @p: .br100, .bgDarkBlue, .absolute, .right0, .flex, .itemsCenter, .justifyCenter, .pointer, .z2, .o0;
            pointer-events: none;
            top: 50%;
            transform: translate(50%,-50%);
            width: 28px;
            height: 28px;
            transition: $duration all;
          }
          .box:hover .resizer {
            @p: .o100;
            pointer-events: all;
          }
          .resizer:hover :global(svg) {
            stroke: $white;
          }
        `}</style>
        <Resizable
          handleSize={handleSize}
          width={this.state.width}
          height={this.state.height}
          onResizeStart={onResizeStart}
          onResize={this.onResize}
          onResizeStop={onResizeStop}
          draggableOpts={draggableOpts}
          minConstraints={minConstraints}
          maxConstraints={maxConstraints}
          lockAspectRatio={lockAspectRatio}
          axis={axis}
        >
          <div style={{width: this.state.width + 'px', height: this.state.height + 'px'}} {...props} />
        </Resizable>
        {!hideArrow && (
          <div className='resizer' onClick={this.toggle}>
            <Icon
              src={
                this.state.width === 67 ?
                require('graphcool-styles/icons/stroke/arrowRight.svg') :
                require('graphcool-styles/icons/stroke/arrowLeft.svg')
              }
              color={$v.white60}
              strokeWidth={4}
              stroke
            />
          </div>
        )}
      </div>
    )
  }

  private toggle = () => {
    this.setState(
      state => {
        return {
          ...state,
          width: state.width === 67 ? 290 : 67,
        }
      },
      () => {
        this.props.onResize(null, {size: {width: this.state.width}})
      },
    )
  }
}
