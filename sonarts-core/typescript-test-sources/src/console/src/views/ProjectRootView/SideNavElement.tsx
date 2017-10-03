import * as React from 'react'
import {Icon, $v} from 'graphcool-styles'
import {Link} from 'react-router'
import * as cn from 'classnames'

interface Props {
  link: string
  active?: boolean
  iconSrc?: string
  text: string
  size?: number
  minimalHighlight?: boolean
  onClick?: () => void
  small?: boolean
  customIcon?: any
}

export default class SideNavElement extends React.Component<Props, null> {
  render() {
    const {link, active, iconSrc, text, size, minimalHighlight, onClick, small, customIcon} = this.props
    return (
      <Link to={link} onClick={onClick} title={text}>
        <div
          className={cn(
            'side-nav-element', {
              active,
              minimalHighlight,
            },
          )}
        >
          <style jsx>{`
           .side-nav-element {
              @p: .relative, .flex, .itemsCenter, .w100, .fw6, .f14, .ttu, .white, .mt12, .o60;
              letter-spacing: 0.8px;
              padding-left: 21px;
              height: 36px;
              transition: color background-color .3s linear;
           }
           .side-nav-element.active, .side-nav-element:hover {
             @p: .o100;
           }
           .side-nav-element.active:not(.minimalHighlight), .side-nav-element:not(.minimalHighlight):hover {
             @p: .bgWhite07;
           }
           .side-nav-element.active:not(.minimalHighlight):before {
             @p: .absolute, .bgGreen, .br2, .z2;
             left: -2px;
             content: "";
             top: -1px;
             height: 38px;
             width: 8px
           }
           .icon {
             @p: .flex, .justifyCenter;
             width: 24px;
           }
           .text {
             @p: .ml4;
           }
           .text.small {
             transform: translateX(50px);
           }
          `}</style>
          {customIcon ? (
            customIcon
          ) : (
            <div className='icon'>
              <Icon
                src={iconSrc}
                color={$v.white}
                height={size || 20}
                width={size || 20}
              />
            </div>
          )}
          <div className={cn('text', {small})}>
            {text}
          </div>
        </div>
      </Link>
    )
  }
}
