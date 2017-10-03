import * as Relay from 'react-relay'

export interface MigrateProjectInput {
  newSchema: string
  isDryRun: boolean
  force: boolean
}

export default class MigrateProject extends Relay.Mutation<MigrateProjectInput, null> {

  getMutation () {
    return Relay.QL`mutation{migrateProject}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on MigrateProjectPayload {
        migrationMessages
        errors
        project {
          schema
        }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [
        Relay.QL`
          fragment  on MigrateProjectPayload {
            errors {
              description
              field
              type
            }
            migrationMessages {
              name
              type 
              action
              description
              subDescriptions {
                action
                description
                name
                type 
              }
            }
            project {
              schema
            }
          }
        `,
      ],
    }]
  }

  getVariables () {
    return this.props
  }
}
