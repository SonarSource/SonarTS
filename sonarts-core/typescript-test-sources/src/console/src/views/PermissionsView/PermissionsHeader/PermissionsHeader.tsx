import * as React from 'react'
import Info from '../../../components/Info'
import * as cn from 'classnames'
import {Link} from 'react-router'

interface Props {
  params: any
  location: any
}

export default class PermissionsHeader extends React.Component<Props, {}> {
  render() {
    const {params} = this.props
    const pathname = decodeURIComponent(this.props.location.pathname)
    const activeTab = pathname.startsWith(`/${params.projectName}/permissions/relations`) ? 1 : 0
    return (
      <div className='permissions-header'>
        <style jsx={true}>{`
          .permissions-header {
            @p: .pt25, .br2, .flexColumn;
          }
          h1 {
            @p: .f38, .fw3, .lhSolid, .ml25;
          }
          .tabs {
            @p: .flex, .justifyStart, .mt25;
          }
          .tabs :global(.tab) {
            @p: .fw3, .f25, .black30, .relative, .mr10, .pointer, .z2;
            bottom: -1px;
            padding: 10px 20px;
          }
          .tabs :global(.tab.active) {
            @p: .black50, .bgWhite, .bt, .bl, .br, .bBlack10, .br2;
          }
          .tabs :global(.tab:not(.active):hover) {
            @p: .black50;
          }
          a {
            @p: .underline, .ml4;
          }
        `}</style>
        <div className='flex itemsCenter'>
          <h1>Permissions</h1>
          <Info>
            You can read more about Permissions
            <a
              href='https://www.graph.cool/docs/reference/platform/authorization/overview-iegoo0heez/'
              target='_blank'
            >
              in the docs
            </a>
          </Info>
        </div>
        <div className='tabs'>
          <Link className={cn('tab', {active: activeTab === 0})} to={`/${params.projectName}/permissions`}>
            Types
          </Link>
          <Link className={cn('tab', {active: activeTab === 1})} to={`/${params.projectName}/permissions/relations`}>
            Relations
          </Link>
        </div>
      </div>
    )
  }
}
