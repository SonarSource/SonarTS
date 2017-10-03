import * as Relay from 'react-relay'

interface Props {
  enumId: string
  name: string
  values: string[]
}

export default class UpdateEnumMutation extends Relay.Mutation<Props, {}> {

  getMutation () {
    return Relay.QL`mutation{updateEnum}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateEnumPayload {
        project
        enum
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        enum: this.props.enumId,
      },
    }]
  }

  getVariables () {
    return this.props
  }
}
