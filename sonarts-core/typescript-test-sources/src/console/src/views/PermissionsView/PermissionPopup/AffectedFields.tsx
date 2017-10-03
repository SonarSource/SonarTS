import * as React from 'react'
import * as Relay from 'react-relay'
import {$p, variables, Icon, $g} from 'graphcool-styles'
import * as cx from 'classnames'
import {Operation, Field} from '../../../types/types'
import mapProps from '../../../components/MapProps/MapProps'
import PermissionField from '../PermissionsList/ModelPermissions/PermissionField'
import {validPermissionField} from '../../../utils/valueparser'
import ErrorInfo from '../../models/FieldPopup/ErrorInfo'
import {PermissionPopupErrors} from './PermissionPopupState'
import Info from '../../../components/Info'

interface Props {
  fields: Field[]
  fieldIds: string[]
  toggleField: (id: string) => void
  selectedOperation: Operation
  applyToWholeModel: boolean
  toggleApplyToWholeModel: () => void
  onSelectAll: () => void
  onReset: () => void
  errors: PermissionPopupErrors
  showErrors: boolean
}

class AffectedFields extends React.Component<Props, {}> {

  render() {
    const {
      fields,
      fieldIds,
      toggleField,
      selectedOperation,
      applyToWholeModel,
      toggleApplyToWholeModel,
      onReset,
      onSelectAll,
    } = this.props
    const fieldsFiltered = fields
      .filter(field => validPermissionField(selectedOperation, field))

    return (
      <div className='wrapper'>
        <style jsx={true}>{`
          .intro {
            @p: .black50, .mr38;
          }
          .buttons {
            @p: .flex, .justifyEnd, .mr25, .mv25;
          }
          .button {
            @p: .buttonShadow, .f14, .fw6, .ttu, .black30, .pointer;
            padding: 7px 9px;
          }
          .button + .button {
            @p: .ml10;
          }
          .fields-error {
            @p: .absolute;
            margin-top: -120px;
            right: -40px;
          }
        `}</style>
        <div className={cx($p.pl38, $p.pr25)}>
          <div className={cx($p.flex, $p.flexRow, $p.itemsStart, $p.justifyBetween, $p.pb25)}>
            <div className='intro'>
              Select the fields for which this permission should be applied.
            </div>
            <Info
              offsetX={100}
              cursorOffset={80}
              customTip={
                <div
                  className={cx(
                    $p.pv6, $p.ph10, $p.ttu, $p.f14, $p.fw6, $p.pointer, $p.flex, $p.flexRow, $p.itemsCenter, $p.br2,
                    $p.buttonShadow, $p.nowrap,
                    {
                      [cx($p.bgWhite, $p.blue)]: !applyToWholeModel,
                      [cx($p.bgBlue, $p.white)]: applyToWholeModel,
                    },
                  )}
                  onClick={toggleApplyToWholeModel}
                >
                  {applyToWholeModel && (
                    <Icon
                      src={require('graphcool-styles/icons/fill/check.svg')}
                      color={variables.white}
                      className={$p.mr4}
                    />
                  )}
                  Apply to whole Type
                </div>
              }
            >
              "Apply to whole Type" means, that also fields that will be created in the future are affected by
              this permission.
            </Info>
          </div>
          <div className={$p.mt16}>
            {fieldsFiltered.length === 0 && (
              <div className={$p.brown}>
                No fields can be effected by this permission,
                as mutation permissions can't be applied to readonly fields
              </div>
            )}
            {fieldsFiltered
              .map(field => (
                <PermissionField
                  key={field.id}
                  field={field}
                  disabled={applyToWholeModel}
                  selected={fieldIds.includes(field.id) || applyToWholeModel}
                  onClick={() => toggleField && toggleField(field.id)}
                  className={cx($p.pointer, $p.mr10, $p.mb10)}
                  editable
                />
              ),
            )}
          </div>
        </div>
        <div className='buttons'>
          <div className='button' onClick={onSelectAll}>Select All</div>
          <div className='button' onClick={onReset}>Reset</div>
        </div>

        {this.props.errors.noFieldsSelected && this.props.showErrors && (
          <div className='fields-error'>
            <ErrorInfo>
              Please specify which fields should be affected by the permission
            </ErrorInfo>
          </div>
        )}
      </div>
    )
  }
}

const MappedAffectedFields = mapProps({
  fields: props => {
    return props.model.fields.edges.map(edge => edge.node)
  },
})(AffectedFields)

export default Relay.createContainer(MappedAffectedFields, {
  fragments: {
    model: () => Relay.QL`
      fragment on Model {
        fields(first: 100) {
          edges {
            node {
              id
              isReadonly
              name
              typeIdentifier
            }
          }
        }
      }
    `,
  },
})
