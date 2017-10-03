// import * as React from 'react'
// import * as cx from 'classnames'
// import { $p, $g, $v, Icon } from 'graphcool-styles'
// import styled from 'styled-components'
//
// interface Props {
//   text: string,
//   link: string,
//   className?: string,
//   newWindow?: boolean,
//   onClick?: () => void
// }
//
// const Root = styled.a`
//
//   &:hover {
//     > div {
//       transform: translate3D(4px,0,0)
//     }
//   }
// `
//
// const Arrow = styled.div`
//   transition: transform .4s ease;
//   transform: translate3D(0,0,0);
// `
//
// export default class CallToAction extends React.Component<Props, {}> {
//
//   render() {
//     return (
//       <Root
//         href={this.props.link}
//     className={cx(
//       $g.uppercaseLabel,
//       $p.f14,
//       $p.blue,
//       $p.flex,
//       $p.itemsCenter,
//       $p.noUnderline,
//       $p.center,
//       $p.dim,
//       $p.pointer,
//       this.props.className,
//   )}
//     target={this.props.newWindow ? '_blank' : '_self'}
//     onClick={this.props.onClick}
//   >
//     {this.props.text}
//     <Arrow className={cx($p.ml10)}>
//     <Icon
//       src={require('graphcool-styles/icons/fill/fullArrowRight.svg')}
//     width={14}
//     height={11}
//     color={$v.blue}
//   />
//     </Arrow>
//     </Root>
//   )
//   }
// }
