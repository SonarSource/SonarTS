import * as React from 'react'
import * as cn from 'classnames'
import { Icon, $v } from 'graphcool-styles'
import { Link } from 'react-router'

interface Props {
  hideArrow?: boolean
  primary?: boolean
  button?: boolean
  green?: boolean
  white?: boolean
  gray?: boolean
  greenOnWhite?: boolean
  arrowToBottom?: boolean
  target?: string
  children?: any
  className?: string
  onClick?: () => void
}

export function A(
  {
    hideArrow, primary, button, green, white, gray, greenOnWhite, arrowToBottom, target, children, className, onClick,
  }: Props,
) {
  const isExternal = target && (target.startsWith('http') || target.startsWith('mailto'))
  return (
    <div
      className={cn(
        'link',
        className, {
          primary, button, green, 'green-on-white': greenOnWhite, white, arrowToBottom, gray,
        },
      )}
      onClick={onClick}
    >
      <style jsx={true}>{`
        .link {
          @p: .pointer, .dib, .blue, .f14;
        }

        .link.gray {
          @p: .darkBlue50;
        }

        .link.gray :global(svg) {
          fill: $darkBlue50;
        }

        .link.gray:hover {
          @p: .darkBlue70;
        }
        .link.gray:hover :global(svg) {
          fill: $darkBlue70;
        }

        .link :global(a), .link > div {
          @p: .flex, .itemsCenter, .ttu, .tracked, .fw6, .nowrap, .noUnderline;
          font-size: inherit;
          color: inherit;
        }

        .button {
          @p: .br2, .pv10, .ph16, .buttonShadow, .white, .bgBlue;
          transition: background .25s ease, box-shadow .25s ease, transform .25s ease;
        }

        .button :global(svg) {
          fill: $white !important;
        }

        .button.green {
          @p: .bgGreen;
        }

        .button.white {
          @p: .darkBlue, .bgWhite;
        }

        .button.green-on-white {
          @p: .green, .bgWhite;
        }

        .button.white :global(svg) {
          fill: $darkBlue !important;
        }

        .button.green-on-white :global(svg) {
          fill: $green !important;
        }

        .link :global(.arrow) {
          @p: .ml10;
        }

        .link.arrowToBottom :global(.arrow) {
          transform: rotate(90deg) !important;
        }

        .link:hover {
          color: #69A4E0;
        }

        .button:hover {
          color: $white;
          background: #3F8AD7;
          box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.15);
          transform: translate3D(0,-1px,0);
        }

        .button.green:hover {
          background: #3CB66F;
        }

        .button.white:hover {
          color: $darkBlue80;
          background: $white;
        }

        .button.green-on-white:hover {
          color: #3CB66F;
          background: $white;
        }

        .link:hover :global(.arrow) {
          animation: move 1s ease infinite;
        }

        .link.arrowToBottom:hover :global(.arrow) {
          animation: moveToBottom 1s ease infinite;
        }

        @keyframes move {
          0% {
            transform: translate3D(0,0,0);
          }

          50% {
            transform: translate3D(3px,0,0);
          }

          100% {
            transform: translate3D(0,0,0);
          }
        }

        @keyframes moveToBottom {
          0% {
            transform: rotate(90deg) translate3D(0,0,0);
          }

          50% {
            transform: rotate(90deg) translate3D(3px,0,0);
          }

          100% {
            transform: rotate(90deg) translate3D(0,0,0);
          }
        }

        @media (min-width: 1000px) {
          .link.primary {
            @p: .f16;
          }
        }

      `}</style>
      {isExternal ? (
          <a href={target} target={target.startsWith('mailto') ? '_self' : '_blank'}>
            { children ? children : 'Learn more'}
            {!hideArrow && (
              <Icon
                src={require('graphcool-styles/icons/fill/fullArrowRight.svg')}
                color={$v.blue}
                width={14}
                height={11}
                className='arrow'
              />
            )}
          </a>
        ) : (
          target ? (
              <Link to={target}>
                {children ? children : 'Learn more'}
                {!hideArrow && (
                  <Icon
                    src={require('graphcool-styles/icons/fill/fullArrowRight.svg')}
                    color={$v.blue}
                    width={14}
                    height={11}
                    className='arrow'
                  />
                )}
              </Link>
            ) : (
              <div>
                {children ? children : 'Learn more'}
                {!hideArrow && (
                  <Icon
                    src={require('graphcool-styles/icons/fill/fullArrowRight.svg')}
                    color={$v.blue}
                    width={14}
                    height={11}
                    className='arrow'
                  />
                )}
              </div>
            )
        )}
    </div>
  )
}

export function Button(
  {hideArrow, primary, green, white, greenOnWhite, arrowToBottom, target, children, className, onClick}: Props,
) {
  return (

    <A
      button
      hideArrow={hideArrow}
      primary={primary}
      green={green}
      white={white}
      greenOnWhite={greenOnWhite}
      arrowToBottom={arrowToBottom}
      target={target}
      className={className}
      onClick={onClick}
    >
      {children || null}
    </A>
  )
}
