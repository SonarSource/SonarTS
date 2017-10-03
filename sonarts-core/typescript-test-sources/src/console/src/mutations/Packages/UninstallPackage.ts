import * as Relay from 'react-relay'

export interface UninstallPackageInput {
  projectId: string
  name: string
}

export default class UninstallPackage extends Relay.Mutation<UninstallPackageInput, null> {

  getMutation () {
    return Relay.QL`mutation{uninstallPackage}`
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UninstallPackagePayload {
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
          fragment  on UninstallPackagePayload {
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
