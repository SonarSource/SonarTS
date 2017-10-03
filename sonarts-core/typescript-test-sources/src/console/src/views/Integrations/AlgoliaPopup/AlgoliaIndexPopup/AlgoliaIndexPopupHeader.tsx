import * as React from 'react'
import {$p, $v} from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'

interface Props {
  onCancel: () => void
  onCreate: () => void
  onUpdate: () => void
  onDelete: () => void
  editing: boolean
  onTitleChange: (e: any) => void
  title: string
}

const IndexInput = styled.input`
  &::-webkit-input-placeholder {
    color: ${$v.white60};
  }
`

export default class AlgoliaIndexPopupHeader extends React.Component<Props,{}> {
  render() {
    const {onCancel, onCreate, onUpdate, onDelete, editing, onTitleChange, title} = this.props
    return (
      <div className={cx($p.bgBlue, $p.pa16, $p.flex, $p.flexRow, $p.itemsCenter, $p.justifyBetween)}>
        <IndexInput
          type='text'
          className={cx($p.white, $p.fw3, $p.f25, $p.bgBlue, $p.w70)}
          placeholder='Type an index name ...'
          autoFocus
          value={title}
          onChange={onTitleChange}
        />
        <div className={cx($p.flex, $p.flexRow, $p.itemsCenter)}>
          {editing && (
            <div
              className={cx($p.white40, $p.f14, $p.pointer, $p.mr38)}
              onClick={onDelete}
            >Delete</div>
          )}
          <div
            className={cx($p.white60, $p.f14, $p.pointer)}
            onClick={onCancel}
          >Cancel</div>
          {editing ? (
            <div
              className={cx($p.ml25, $p.white, $p.f14, $p.pv6, $p.ph10, $p.br2, $p.bgBlack30, $p.pointer)}
              onClick={onUpdate}
            >
              Update
            </div>
          ) : (
            <div
              className={cx($p.ml25, $p.white, $p.f14, $p.pv6, $p.ph10, $p.br2, $p.bgBlack30, $p.pointer)}
              onClick={onCreate}
            >
              Create
            </div>
          )}
        </div>
      </div>
    )
  }
}
