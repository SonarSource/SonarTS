import * as React from 'react'
import {Field} from '../../../types/types'
import {isScalar} from '../../../utils/graphql'
import {Icon, $v} from 'graphcool-styles'
import * as cn from 'classnames'

interface Props {
  field: Field
  big?: boolean
}

export default class TypeTag extends React.Component<Props, null> {
  render() {
    const {field, big} = this.props

    let type: string = isScalar(field.typeIdentifier) ? field.typeIdentifier : field.relatedModel.name
    if (field.isList) {
      type = `[${type}]`
    }
    if (field.isRequired) {
      type = `${type}!`
    }
    return (
      <div className={cn('type-tag', {big})}>
        <style jsx>{`
        .type-tag {
          @p: .bgBlack04, .br2, .black50, .dib, .ml16, .f12, .flex, .itemsCenter, .fw4;
          font-family:
                  'Source Code Pro',
                  'Consolas',
                  'Inconsolata',
                  'Droid Sans Mono',
                  'Monaco',
                  monospace;
          padding: 3px 6px 4px 6px;
        }
        .type-tag.big {
          @p: .f16;
          padding: 5px 8px 6px 8px;
        }
        .type-tag :global(i) {
          @p: .mr4;
        }
        .type-tag + .type-tag {
          @p: .ml10;
        }
      `}</style>
        {!isScalar(field.typeIdentifier) && (
          <Icon
            width={14}
            height={14}
            src={require('assets/icons/link.svg')}
            stroke
            color={$v.gray60}
          />
        )}
        <span>
          {type}
        </span>
      </div>
    )
  }
}
