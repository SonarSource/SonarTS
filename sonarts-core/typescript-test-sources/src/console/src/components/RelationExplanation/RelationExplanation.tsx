import * as React from 'react'
import * as Relay from 'react-relay'
import {getModelName, getModelNamePlural} from '../../utils/namegetter'
import {Project} from '../../types/types'
const classes: any = require('./RelationExplanation.scss')

interface Props {
  project: Project
  fieldOnLeftModelName: string
  fieldOnRightModelName: string
  fieldOnLeftModelIsList: boolean
  fieldOnRightModelIsList: boolean
  leftModelId: string
  rightModelId: string
}

class RelationExplanation extends React.Component<Props, {}> {

  render() {
    const {fieldOnLeftModelIsList, leftModelId, fieldOnRightModelIsList, rightModelId} = this.props
    const models = this.props.project.models.edges.map((edge) => edge.node)
    const leftModelMultiplicity = fieldOnLeftModelIsList ? 'Many' : 'One'
    const leftModelName = fieldOnRightModelIsList
      ? getModelNamePlural(leftModelId, models) : getModelName(leftModelId, models)
    const leftNameS = getModelName(leftModelId, models).slice(-1) === 's'
      ? `'` : `'s`

    const rightModelMultiplicity = fieldOnRightModelIsList ? 'Many' : 'One'
    const rightModelName = fieldOnLeftModelIsList
      ? getModelNamePlural(rightModelId, models) : getModelName(rightModelId, models)
    const rightNameS = getModelName(rightModelId, models).slice(-1) === 's' ? `'` : `'s`
    return (
      <div className={classes.root}>
        <div className={classes.sentence}>
          <span className={classes.multiplicity}>{rightModelMultiplicity}</span>
          {' '}
          <span className={classes.model}>{leftModelName}</span>
          {` ${rightModelMultiplicity === 'One' ? 'is' : 'are'} related to `}
          <span className={classes.multiplicity}>{leftModelMultiplicity.toLowerCase()}</span>
          {' '}
          <span className={classes.model}>{rightModelName}</span>
        </div>
        {this.props.fieldOnLeftModelName &&
        <div className={classes.sentence}>
          <span className={classes.model}>{getModelName(leftModelId, models)}</span>
          {`${leftNameS} field `}
          <span className={classes.field}>{this.props.fieldOnLeftModelName}</span>
          {` represents `}
          <span className={classes.multiplicity}>{leftModelMultiplicity.toLowerCase()}</span>
          {' '}
          <span className={classes.model}>{rightModelName}</span>
        </div>
        }
        {this.props.fieldOnRightModelName &&
        <div className={classes.sentence}>
          <span className={classes.model}>{getModelName(rightModelId, models)}</span>
          {`${rightNameS} field `}
          <span className={classes.field}>{this.props.fieldOnRightModelName}</span>
          {` represents `}
          <span className={classes.multiplicity}>{rightModelMultiplicity.toLowerCase()}</span>
          {' '}
          <span className={classes.model}>{leftModelName}</span>
        </div>
        }
      </div>
    )
  }

}

export default Relay.createContainer(RelationExplanation, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
          models (first: 1000) {
            edges {
              node {
                id
                name
                namePlural
              }
            }
        }
      }
    `,
  },
})
