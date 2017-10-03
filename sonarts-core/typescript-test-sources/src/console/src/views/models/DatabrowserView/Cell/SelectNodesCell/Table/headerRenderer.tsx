import * as React from 'react'
import TypeTag from '../../../../../SchemaView/SchemaOverview/TypeTag'

/**
 * Default table header renderer.
 */
export default function headerRenderer(field) {
  return ({
    columnData,
    dataKey,
    disableSort,
    label,
    sortBy,
    sortDirection,
  }) => {
    const showSortIndicator = sortBy === dataKey

    return (
      <div className='header-cell'>
        <style jsx>{`
          .header-cell {
            @p: .flex, .itemsCenter;
          }
        `}</style>
        <span
          className='ReactVirtualized__Table__headerTruncatedText'
          key='label'
          title={label}
        >
          {label}
        </span>
        <TypeTag field={field} />
      </div>
    )
  }
}
