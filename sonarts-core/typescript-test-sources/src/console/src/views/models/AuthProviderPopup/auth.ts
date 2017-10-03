export default function getAnonymousPackage(typeName: string) {
  return `name: anonymous-auth-provider

functions:
  authenticateAnonymousUser:
    schema: >
      interface input {
        secret: String!
      }
      interface output {
        token: String!
        id: String!
      }
    type: webhook
    url: https://162yijip11.execute-api.eu-west-1.amazonaws.com/dev/anonymous-auth-provider/authenticateAnonymousUser

interfaces:
  AnonymousUser:
    schema: >
      interface AnonymousUser {
        secret: String @isUnique
        isVerified: Boolean! @defaultValue(value: false) @migrationValue(value: false)
      }

# This is configured by user when installing
install:
  - type: mutation
    binding: functions.authenticateAnonymousUser
    name: authenticateAnonymous${typeName}
    onType: ${typeName}
  - type: interface
    binding: interfaces.AnonymousUser
    onType: ${typeName}`
}
