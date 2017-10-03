import * as React from 'react'
import {getModelName} from '../../utils/namegetter'
import {Model} from '../../types/types'
const classes: any = require('./GeneratedMutations.scss')

interface MutationStructure {
  name: string
  args: string[]
}

interface Props {
  models: Model[]
  fieldOnLeftModelName: string
  fieldOnRightModelName: string
  fieldOnLeftModelIsList: boolean
  fieldOnRightModelIsList: boolean
  leftModelId: string
  rightModelId: string
  relationName: string
}

export default class GeneratedMutations extends React.Component<Props, {}> {

  render() {
    return (
      <div className={classes.root}>
        {this.getMutations().map((mutation) =>
        <div className={classes.mutation}>{mutation.name}({mutation.args.join(', ')})</div>,
        )}
      </div>
    )
  }

  private getMutations = (): MutationStructure[] => {
    if (this.props.fieldOnLeftModelIsList && this.props.fieldOnRightModelIsList) {
      const args = this.getUsualMutationArgs()
      return [
        {
          name: `set${this.props.relationName}`,
          args,
        },
        {
          name: `unset${this.props.relationName}`,
          args,
        },
      ]
    } else if (!this.props.fieldOnLeftModelIsList && !this.props.fieldOnRightModelIsList) {
      const args = this.getUsualMutationArgs()
      return [
        {
          name: `addTo${this.props.relationName}`,
          args,
        },
        {
          name: `removeFrom${this.props.relationName}`,
          args,
        },
      ]
    } else {
      const args = this.getOneToManyArgs()
      return [
        {
          name: `addTo${this.props.relationName}`,
          args,
        },
        {
          name: `removeFrom${this.props.relationName}`,
          args,
        },
      ]
    }
  }

  private getUsualMutationArgs = (): string[] => {
    const sameField = this.props.fieldOnLeftModelName === this.props.fieldOnRightModelName
    const sameModel = this.props.leftModelId === this.props.rightModelId

    if (sameModel && sameField) {
      return [
        `${this.props.fieldOnLeftModelName}1Id`,
        `${this.props.fieldOnRightModelName}2Id`,
      ]
    } else if (!sameModel && sameField) {
      return [
        `${this.props.fieldOnLeftModelName}${getModelName(this.props.leftModelId, this.props.models)}Id`,
        `${this.props.fieldOnRightModelName}${getModelName(this.props.rightModelId, this.props.models)}Id`,
      ]
    } else {
      return [
        `${this.props.fieldOnLeftModelName}Id`,
        `${this.props.fieldOnRightModelName}Id`,
      ]
    }
  }

  private getOneToManyArgs = (): string[] => {
    return [
      `${this.props.fieldOnLeftModelName}Id`,
      `${this.props.fieldOnRightModelName}Id`,
    ]
  }
}
