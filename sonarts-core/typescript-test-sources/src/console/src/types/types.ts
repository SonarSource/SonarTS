import {Step} from './gettingStarted'
import {TypedValue} from './utils'

export interface RelayConnection<T> {
  edges: RelayEdge<T>[]
}

interface RelayEdge<T> {
  node: T
}

export interface Viewer {
  id: string
  user: Customer
  model: Model
  project: Project
  crm: any
}

export interface Customer {
  id: string
  name: string
  email: string
  projects: RelayConnection<Project>
  crm: CrmSystemBridge
}

export type SeatStatus = 'JOINED' | 'INVITED_PROJECT' | 'INVITED_CUSTOMER'

export interface Seat {
  name: string | null
  email: string
  isOwner: boolean
  status: SeatStatus
}

export interface CrmSystemBridge {
  id: string
  information: CrmCustomerInformation
  onboardingStatus: CrmOnboardingStatus
  customer: Customer
}

export interface CrmCustomerInformation {
  id: string
  name: string
  email: string
  isBeta: boolean
}

export type Environment = 'Node' | 'Browser'
export type GraphQLClient = 'fetch' | 'lokka' | 'relay' | 'apollo'

export type Example = 'ReactRelay' | 'ReactNativeApollo' | 'ReactApollo' | 'AngularApollo' | 'VueApollo'

export interface CrmOnboardingStatus {
  id: string
  gettingStarted: Step
  gettingStartedSkipped: boolean
  gettingStartedExample: Example | null
}

export interface Project {
  id: string
  name: string
  alias: string
  version: number
  models: RelayConnection<Model>
  relations: RelayConnection<Relation>
  actions: RelayConnection<Action>
  permanentAuthTokens: RelayConnection<PermanentAuthToken>
  authProviders: RelayConnection<AuthProvider>
  integrations: RelayConnection<Integration>
  actionSchema: string
  schema: string
  typeSchema: string
  enumSchema: string
  seats: RelayConnection<Seat>
  projectBillingInformation: ProjectBillingInformation
  region?: string
  packageDefinitions: RelayConnection<PackageDefinition>
  functions: RelayConnection<ServerlessFunction>
}

export interface ServerlessFunction {
  id: string
  name: string
  type?: FunctionType
  binding?: FunctionBinding
  webhookUrl: string
  _webhookUrl?: string
  webhookHeaders: string
  _webhookHeaders?: {[key: string]: string}
  inlineCode?: string
  auth0Id?: string
  logs: RelayConnection<Log>
  stats?: FunctionStats
  modelId?: string
  model?: Model
  operation?: RequestPipelineMutationOperation
  isActive: boolean
  query?: string
}

export interface FunctionStats {
  requestHistogram: number[]
  requestCount: number
  errorCount: number
  lastRequest: Date
}

export type RequestPipelineMutationOperation = 'CREATE' | 'UPDATE' | 'DELETE'

export interface Log {
  id: string
  requestId: string
  duration: number
  status: LogStatus
  timestamp: Date
  message: string
}

export type LogStatus = 'SUCCESS' | 'FAILURE'

export interface RequestPipelineMutationFunction extends ServerlessFunction {
  model: Model
  binding: FunctionBinding
}

export type FunctionType = 'WEBHOOK' | 'AUTH0'

export type FunctionBinding = 'TRANSFORM_ARGUMENT' | 'PRE_WRITE' | 'TRANSFORM_PAYLOAD'

export interface PackageDefinition {
  id: string
  definition: string
  email: string
  name: string
}

export interface ProjectBillingInformation {
  plan: string
}

export interface Integration {
  id: string
  isEnabled: boolean
  name: IntegrationNameType
  type: IntegrationTypeType
}

export interface SearchProviderAlgolia extends Integration {
  applicationId: string
  apiKey: string
  algoliaSyncQueries: RelayConnection<AlgoliaSyncQuery>
  algoliaSchema: string
}

export interface AlgoliaSyncQuery {
  id: string
  indexName: string
  fragment: string
  isEnabled: boolean
  model: Model
}

export type IntegrationNameType =
    'AUTH_PROVIDER_AUTH0'
  | 'AUTH_PROVIDER_DIGITS'
  | 'AUTH_PROVIDER_EMAIL'
  | 'SEARCH_PROVIDER_ALGOLIA'

export type IntegrationTypeType = 'AUTH_PROVIDER' | 'SEARCH_PROVIDER'

export type FieldType =
    'Relation'
  | 'Int'
  | 'String'
  | 'Boolean'
  | 'Enum'
  | 'Float'
  | 'DateTime'
  | 'Password'
  | 'Json'
  | 'GraphQLID'

export interface Field {
  id: string
  name: string
  description: string
  isRequired: boolean
  isList: boolean
  isUnique: boolean
  enumId?: string
  enum?: Enum
  isSystem?: boolean
  isReadonly?: boolean
  typeIdentifier?: FieldType
  defaultValue?: TypedValue
  enumValues: string[]
  reverseRelationField?: Field
  relatedModel?: Model
  relation?: Relation
  model?: Model
  migrationValue?: TypedValue
  constraints?: Constraint[]
  interface?: Interface
}

interface Interface {
  isSystem: boolean
  name: string
}

export interface Relation {
  id: string
  name: string
  isRequired: boolean
  description?: string
  leftModel: Model
  rightModel: Model
  fieldOnLeftModel: Field
  fieldOnRightModel: Field
  permissionSchema: string
  permissions: RelayConnection<RelationPermission>
  permissionQueryArguments: PermissionQueryArgument[]
}

export type UserType = 'EVERYONE' | 'AUTHENTICATED'

export type PermissionRuleType = 'NONE' | 'GRAPH' | 'WEBHOOK'

export interface Enum {
  id: string
  name: string
  values: string[]
}

export interface Model {
  id: string
  name: string
  namePlural: string
  fields: RelayConnection<Field>
  unconnectedReverseRelationFieldsFrom?: Field[]
  itemCount: number
  description: string
  isSystem: boolean
  permissions: RelayConnection<ModelPermission>
  permissionSchema: string
  permissionQueryArguments: PermissionQueryArgument[]
}

export interface PermissionQueryArgument {
  name: string
  typeName: string
  group: string
}

export interface ModelPermission {
  id: string
  fieldIds?: string[]
  ruleWebhookUrl?: string
  rule: Rule
  ruleName?: string
  ruleGraphQuery?: string
  applyToWholeModel: boolean
  isActive: boolean
  operation: Operation
  userType: UserType
}

export interface RelationPermission {
  id: string
  connect: boolean
  disconnect: boolean
  ruleWebhookUrl?: string
  rule: Rule
  ruleName?: string
  ruleGraphQuery?: string
  isActive: boolean
  userType: UserType
}

export type Rule = 'NONE' | 'GRAPH' | 'WEBHOOK'
export type Operation = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'

export type ActionTriggerType = 'MUTATION_MODEL' | 'MUTATION_RELATION'
export type ActionHandlerType = 'WEBHOOK'

export interface Action {
  id: string
  isActive: boolean
  description: string
  triggerType: ActionTriggerType
  handlerType: ActionHandlerType
  triggerMutationModel?: ActionTriggerMutationModel
  triggerMutationRelation?: ActionTriggerMutationRelation
  handlerWebhook?: ActionHandlerWebhook
}

export type ActionTriggerMutationModelMutationType = 'CREATE' | 'UPDATE' | 'DELETE'

export interface ActionTriggerMutationModel {
  id: string
  fragment: string
  model: Model
  mutationType: ActionTriggerMutationModelMutationType
}

export type ActionTriggerMutationRelationMutationType = 'ADD' | 'REMOVE'

export interface ActionTriggerMutationRelation {
  id: string
  fragment: string
  relation: Relation
  mutationType: ActionTriggerMutationRelationMutationType
}

export interface ActionHandlerWebhook {
  id: string
  url: string
}

export interface User {
  id: string
  createdAt?: string
}

export interface Node {
  id: string
  [key: string]: any
}

export interface PermanentAuthToken {
  id: string
  name: string
  token: string
}

export interface AuthProvider {
  id: string
  type: AuthProviderType
  isEnabled: boolean
  digits: AuthProviderDigits | null
  auth0: AuthProviderAuth0 | null
}

export type AuthProviderType = 'AUTH_PROVIDER_EMAIL' | 'AUTH_PROVIDER_DIGITS'
  | 'AUTH_PROVIDER_AUTH0' | 'anonymous-auth-provider'

export interface AuthProviderAuth0 {
  domain: string
  clientId: string
  clientSecret: string
}

export interface AuthProviderDigits {
  consumerKey: string
  consumerSecret: string
}

export interface OrderBy {
  fieldName: string
  order: 'ASC' | 'DESC'
}

export type FieldWidths = { [key: string]: number }

declare global {
  interface Element {
    scrollIntoViewIfNeeded(centerIfNeeded: boolean): void
  }
}

export interface TetherStep {
  step: Step
  title: string
  description?: string
  buttonText?: string
  copyText?: string
}

export type RelationPopupDisplayState = 'DEFINE_RELATION' | 'SET_MUTATIONS'
export type Cardinality = 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY'

export type BreakingChangeIndicatorStyle = 'TOP' | 'RIGHT'

export type ConstraintType = 'REGEX' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'EQUALS' | 'LENGTH'
export type Operator = 'EQ' | 'GT' | 'LT' | 'GTE' | 'LTE'

export interface Constraint {
  type: ConstraintType
  value: string
  lengthOperator?: Operator
}

export type PricingPlan = '2017-02-free' | '2017-02-project' | '2017-02-startup' | '2017-02-growth' | 'enterprise'

export interface PricingPlanInfo {
  name: string
  price: number
  maxStorage: number
  maxRequests: number
  maxSeats: number
  pricePerAdditionalMB: number
  pricePerThousandAdditionalRequests: number
}

export type CreditCardInputDisplayState = 'CREDIT_CARD_DATA' | 'ADDRESS_DATA'

export type Region = 'EU_WEST_1' | 'AP_NORTHEAST_1' | 'US_WEST_2'

export interface PermissionVariable {
  name: string
  typeIdentifier: FieldType
  category?: string
  isRequired: boolean
  isList: boolean
}

export interface Invoice {
  overageRequests: number
  overageStorage: number
  timestamp: string
  total: number
  usageRequests: number[]
  usageStorage: number[]
}

export interface CreditCardInfo {
  last4: string
  expMonth: number
  expYear: number
  cardHolderName: string
  addressLine1: string
  addressLine2?: string
  addressCity: string
  addressZip: string
  addressState: string
  addressCountry: string
}

export interface ProjectBillingInformation {
  plan: string
  invoices: Invoice[]
}
