import * as React from 'react'
import {Link} from 'react-router'

interface Props {
  params: any
}

const TabBar = ({params}: Props) => {

  return (
    <div className='flex'>
      <style jsx={true} global>{`

      .linkStyle {
        @inherit: .ttu, .fw6, .black20, .ph25, .pv16, .bBlack10;
      }

      .linkStyle.activeLinkStyle {
        @inherit: .ttu, .fw6, .black50, .ph25, .pv16, .bgWhite, .bt, .bl, .br, .br2, .bw2, .bBlack10;
        margin-bottom: -2px;

      }

      `}</style>
      <Link
        className='linkStyle'
        activeClassName='activeLinkStyle'
        to={`/${params.projectName}/settings/general`}
      >
          General
      </Link>
      <Link
        className='linkStyle'
        activeClassName='activeLinkStyle'
        to={`/${params.projectName}/settings/authentication`}
      >
          Authentication
      </Link>
      <Link
        className='linkStyle'
        activeClassName='activeLinkStyle'
        to={`/${params.projectName}/settings/export`}
      >
        Export
      </Link>
      <Link
        className='linkStyle'
        activeClassName='activeLinkStyle'
        to={`/${params.projectName}/settings/billing`}
      >
        Billing
      </Link>
      <Link
        className='linkStyle'
        activeClassName='activeLinkStyle'
        to={`/${params.projectName}/settings/team`}
      >
        Team
      </Link>
    </div>
  )

}

export default TabBar
