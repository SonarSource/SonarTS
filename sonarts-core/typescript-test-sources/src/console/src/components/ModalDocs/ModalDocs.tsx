import * as React from 'react'
import * as cx from 'classnames'
import {$g} from 'graphcool-styles'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import DocsResource from './DocsResource'
import VideoPopup from './VideoPopup'

export type ResourceType = 'faq' | 'guide' | 'example' | 'article'

export interface Resource {
  title: string
  link: string
  type: ResourceType
}

interface Props {
  resources: Resource[]
  // the ID is needed for the remember function of the active state
  id: string
  title: string
  videoId?: string
  boring?: boolean
}

interface State {
  open: boolean
  firstTime: boolean
  videoOpen: boolean
}

export default class ModalDocs extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    const key = 'modal-docs-opened:' + props.id
    const opened = localStorage.getItem(key)

    this.state = {
      open: false,
      firstTime: !Boolean(opened),
      videoOpen: false,
    }

    localStorage.setItem(key, '1')
  }

  render() {
    const active = this.state.firstTime || this.state.open
    const {boring} = this.props

    return (
      <div className={cx('modal-docs', {boring, active})}>
        <style jsx>{`
          .modal-docs {
            @p: .relative;
          }
          .header {
            @p: .flex, .itemsCenter;
          }
          .icon {
            @p: .br100, .flex, .itemsCenter, .justifyCenter, .f25, .fw6, .tc, .bgBlack07, .black30, .pointer;
            width: 38px;
            height: 38px;
          }
          .icon:hover {
            @p: .bgBlack10, .black40;
          }
          .icon.active {
            @p: .bgLightgreen20, .green;
          }
          .icon.active:hover {
            @p: .bgLightgreen30;
          }
          .docs {
            @p: .absolute;
            top: 16px;
            right: -38px;
            transform: translateX(100%);
          }
          .modal-docs.boring .docs {
            @p: .top0, .right0;
            transform: translateX(0);
          }
          .modal-docs.boring .docs.active {
            @p: .buttonShadow, .bgWhite, .pa10, .br2;
            top: -15px;
            right: -10px;
          }
          .modal-docs.boring .header {
            flex-direction: row-reverse;
          }
          .content {
            @p: .mt25, .ml6;
          }
          .button {
            @p: .bgWhite, .pv10, .ph16, .lhSolid, .br2, .f20, .pointer, .nowrap;
            @p: .inlineFlex, .buttonShadow, .itemsCenter, .noUnderline;
            color: rgba(23,42,58,.7);
          }
          .button:hover {
            @p: .bgBlack10;
          }
          .button span {
            @p: .ml10;
          }
          .button:hover :global(svg) {
            fill: rgba(23,42,58,.5);
          }
          .title  {
            @p: .green, .f16, .fw6, .ttu, .ml10;
          }
        `}</style>
        {this.props.children}
        <div className={cx('docs', {active})}>
          <div className='header'>
            <div className={cx('icon', {active})} onClick={this.toggle}>
              <span>?</span>
            </div>
            {this.state.open && (
              <div className='title'>{this.props.title}</div>
            )}
          </div>
          {this.props.videoId && this.state.open && (
            <div className='content'>
              <div className='button' onClick={this.openVideo}>
                <Icon
                  src={require('graphcool-styles/icons/fill/triangle.svg')}
                  color='rgba(23,42,58,.4)'
                  width={15}
                  height={13}
                />
                <span>Watch an introduction</span>
              </div>
            </div>
          )}
          {this.state.open && (
            <div className='content'>
              {this.props.resources.map(resource => (
                <DocsResource
                  key={resource.link}
                  resource={resource}
                />
              ))}
            </div>
          )}
        </div>
        {this.state.videoOpen && (
          <VideoPopup
            videoId={this.props.videoId || ''}
            onRequestClose={this.closeVideo}
          />
        )}
      </div>
    )
  }

  private openVideo = () => {
    this.setState({videoOpen: true} as State)
  }

  private closeVideo = () => {
    this.setState({videoOpen: false} as State)
  }

  private toggle = () => {
    this.setState(state => ({
      ...state,
      open: !state.open,
    }))
  }
}
