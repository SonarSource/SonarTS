import * as Relay from 'react-relay'

export interface InstallPackageInput {
  projectId: string
  definition: string
}

export default class InstallPackage extends Relay.Mutation<InstallPackageInput, null> {

  getMutation () {
    return Relay.QL`mutation{installPackage}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on InstallPackagePayload {
        project {
          schema
          packageDefinitions
        }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [
          Relay.QL`
          fragment  on InstallPackagePayload {
            project {
              schema
              packageDefinitions(first: 100) {
                edges {
                  node {
                    id
                    definition
                    name
                  }
                }
              }
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
