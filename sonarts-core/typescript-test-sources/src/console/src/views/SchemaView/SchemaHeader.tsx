import * as React from 'react'
import {$v,Icon} from 'graphcool-styles'
import Info from '../../components/Info'
import {Link} from 'react-router'
import * as cx from 'classnames'
import ComingSoonTag from './ComingSoonTag'

interface Props {
  projectName: string
  location: any
  typesChanged: boolean
  enumsChanged: boolean
}

export default class SchemaHeader extends React.Component<Props,null> {
  render() {
    const {projectName, typesChanged, enumsChanged} = this.props

    return (
      <div className='schema-header'>
        <style jsx={true}>{`
          .schema-header {
            @p: .flex, .justifyBetween, .flexFixed;
            height: 58px;
            padding-right: 12px;
            background-color: #08131B;
          }
          .button {
            @p: .br2, .darkBlue, .f14, .fw6, .inlineFlex, .ttu, .itemsCenter, .pointer;
            letter-spacing: 0.53px;
            background-color: rgb(185,191,196);
            padding: 7px 10px 8px 10px;
            .text {
              @p: .ml10;
            }
          }
          .button :global(i) {
            @p: .o70;
          }
          .info {
            @p: .mr16;
          }
          .right {
            @p: .flex, .itemsCenter;
          }
          a {
            @p: .underline;
          }
          .left {
            @p: .flex, .itemsEnd;
          }
          .tab {
            @p: .br2, .white30, .brTop, .ml10, .flex, .itemsCenter, .pointer;
            padding: 10px 13px;
          }
          .tab.active {
            @p: .bgDarkBlue, .white;
          }
          .tab.inactive {
            @p: .bgDarkerBlue;
          }
          .tab.inactive:hover {
            @p: .bgDarkBlue;
          }
          .tab span {
            @p: .ttu, .fw6, .f16, .ml6;
          }
          .star {
            @p: .f25, .relative;
            line-height: 1;
            transform: translateY(4px);
          }
          .types.active :global(.light) {
            fill: $green;
          }
          .types.active :global(.dark) {
            fill: rgba(28,191,50,.50);
          }
          .interfaces.active :global(.dark) {
            fill: rgba(164,3,111,.7);
          }
          .interfaces.active :global(.light) {
            fill: $purple;
          }
          .enums.active :global(.light) {
            fill: rgba(241,143,1,.6);
          }
          .enums.active :global(.dark) {
            fill: $lightOrange;
          }
          .coming-soon {
            cursor: not-allowed;
          }
        `}</style>
        <div className='left'>
          {/*
          <Link to={`/${projectName}/schema`}>
            <div className={cx(
              'tab',
              {
                'active': `/${projectName}/schema` === this.props.location.pathname,
              },
            )}>
              <div className='star'>*</div>
              <span>All</span>
            </div>
          </Link>
           */}
          <Link to={`/${projectName}/schema/types`}>
            <div className={this.tabClass('types')}>
              <Icon
                src={require('graphcool-styles/icons/fill/types.svg')}
                width={19}
                height={18}
                color={$v.white20}
              />
              <span>Types {typesChanged ? ' *' : ''}</span>
            </div>
          </Link>
          <div className={'coming-soon tab' /* + this.tabClass('interfaces')*/}>
            <Icon
              src={require('graphcool-styles/icons/fill/interfaces.svg')}
              width={19}
              height={18}
              color={$v.white20}
            />
            <span>Interfaces</span>
            <ComingSoonTag />
          </div>
          <Link to={`/${projectName}/schema/enums`}>
            <div className={this.tabClass('enums')}>
              <Icon
                src={require('graphcool-styles/icons/fill/enums.svg')}
                width={23}
                height={9}
                color={$v.white20}
              />
              <span>Enums {enumsChanged ? ' *' : ''}</span>
            </div>
          </Link>
        </div>
        <div className='right'>
          <div className='info'>
            <Info bright slim>
              {'To learn more about your Graphcool Data Schema, just have a look '}
              <a
                target='_blank'
                href='https://www.graph.cool/docs/reference/platform/data-schema-ahwoh2fohj'
              >
                {'in our Docs'}
              </a>
            </Info>
          </div>
          <Link to={`/${this.props.projectName}/graph-view`}>
            <div className='button'>
              <Icon
                width={15}
                height={15}
                src={require('assets/icons/graphView.svg')}
                color={$v.darkBlue}
              />
              <div className='text'>Graph View</div>
            </div>
          </Link>
        </div>
      </div>
    )
  }

  private tabClass(tabName: string) {
    let className = 'tab'
    const typesActive = tabName === 'types' ? this.props.location.pathname.endsWith('schema') : false
    if (this.props.location.pathname.endsWith(`schema/${tabName}`) || typesActive) {
      className += ' active'
    } else {
      className += ' inactive'
    }
    return className + ` ${tabName}`
  }
}
