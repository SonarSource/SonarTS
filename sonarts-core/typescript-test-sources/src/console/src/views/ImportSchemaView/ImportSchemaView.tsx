import * as React from 'react'
import ImportSchema from './ImportSchema'
import {Icon, $v} from 'graphcool-styles'

export default class ImportSchemaView extends React.Component<null,null> {
  render() {
    return (
      <div className='import-schema-view'>
        <style jsx>{`
          .import-schema-view {
            @p: .bgBlack04, .w100, .h100;
          }
          .logo {
            @p: .green50, .fw6, .f20, .ttu, .flex, .itemsCenter;
            padding-top: 47px;
            margin-left: 51px;
            span {
              margin-left: 18px;
            }
          }
        `}</style>
        <div className='logo'>
          <Icon
            src={require('graphcool-styles/icons/fill/graphcoolLogoSpaced.svg')}
            color={$v.green}
            width={40}
            height={40}
          />
          <span>
            Graphcool
          </span>
        </div>
        <ImportSchema />
      </div>
    )
  }
}
