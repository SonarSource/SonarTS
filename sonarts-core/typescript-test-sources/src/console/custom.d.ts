declare module 'react-router-relay'
declare module 'lokka'
declare module 'drumstick'
declare module 'lokka-transport-http'
declare module 'react-router'
declare module 'react-redux'
declare module 'react-tether'
declare module 'react-helmet'
declare module 'graphql'
declare module 'graphql/*'
declare module 'graphiql'
declare module 'map-props'
declare module 'react-twitter-widgets'
declare module 'react-copy-to-clipboard'
declare module 'react-click-outside'
declare module 'react-autocomplete'
declare module 'react-datetime'
declare module 'calculate-size'
declare module 'rc-tooltip'
declare module 'react-tagsinput'
declare module 'graphiql/dist/components/QueryEditor'
declare module 'react-notification-system'
declare module 'react-toggle-button'
declare module 'react-virtualized'
declare module 'react-addons-shallow-compare'
declare module 'react-test-renderer'
declare module 'redux-mock-store'
declare module 'nock'
declare module 'identity-obj-proxy'
declare module 'styled-components' // https://github.com/styled-components/styled-components/issues/89
declare module 'redux-logger'
declare module 'react-input-enhancements'
declare module 'auth0-lock'
declare module 'enzyme-to-json'
declare module 'graphcool-graphiql'
declare module 'downloadjs'

declare var Raven: any
declare var Intercom: any
declare var Stripe: any
declare var analytics: any
declare var __BACKEND_ADDR__: string
declare var __EXAMPLE_ADDR__: string
declare var __SUBSCRIPTIONS_EU_WEST_1__: any
declare var __SUBSCRIPTIONS_US_WEST_2__: any
declare var __SUBSCRIPTIONS_AP_NORTHEAST_1__: any
declare var __HEARTBEAT_ADDR__: string | boolean
declare var __INTERCOM_ID__: string
declare var __STRIPE_PUBLISHABLE_KEY__: string
declare var __CLI_AUTH_TOKEN_ENDPOINT__: string
declare var __METRICS_ENDPOINT__: string
declare var __GA_CODE__: string
declare var __AUTH0_DOMAIN__: string
declare var __AUTH0_CLIENT_ID__: string
declare var graphcoolAlert: any
declare var graphcoolConfirm: any

declare interface Window {
  devToolsExtension?: () => any
  Intercom: any
}

declare module 'cuid' {
  export default function cuid(): string
}

declare module 'react-relay' {

  // fragments are a hash of functions
  interface Fragments {
    [query: string]: ((variables?: RelayVariables) => string)
  }

  interface CreateContainerOpts {
    initialVariables?: Object
    fragments: Fragments
    prepareVariables?(prevVariables: RelayVariables): RelayVariables
  }

  interface RelayVariables {
    [name: string]: any
  }

  // add static getFragment method to the component constructor
  interface RelayContainerClass<T> extends React.ComponentClass<T> {
    getFragment: ((q: string, vars?: RelayVariables) => string)
  }

  interface RelayQueryRequestResolve {
    response: any
  }

  interface RelayMutationRequest {
    getQueryString(): string
    getVariables(): RelayVariables
    resolve(result: RelayQueryRequestResolve)
    reject(errors: any)
  }

  interface RelayQueryRequest {
    resolve(result: RelayQueryRequestResolve)
    reject(errors: any)

    getQueryString(): string
    getVariables(): RelayVariables
    getID(): string
    getDebugName(): string
  }

  interface RelayNetworkLayer {
    supports(...options: string[]): boolean
  }

  class DefaultNetworkLayer implements RelayNetworkLayer {
    constructor(host: string, options: any)
    supports(...options: string[]): boolean
  }
  interface RelayQuery {
    query: string
  }
  function createContainer<T>(component: React.ComponentClass<T>, params?: CreateContainerOpts): RelayContainerClass<any>
  function injectNetworkLayer(networkLayer: RelayNetworkLayer)
  function isContainer(component: React.ComponentClass<any>): boolean
  function QL(...args: any[]): string
  function createQuery(query: string, variables: RelayVariables)

  class Route {
    constructor(params?: RelayVariables)
  }

  // Relay Mutation class, where T are the props it takes and S is the returned payload from Relay.Store.update.
  // S is typically dynamic as it depends on the data the app is currently using, but it's possible to always
  // return some data in the payload using REQUIRED_CHILDREN which is where specifying S is the most useful.
  class Mutation<T,S> {
    props: T

    constructor(props: T)
    static getFragment(q: string): string
  }

  interface Transaction {
    getError(): Error
    Status(): number
  }

  interface StoreUpdateCallbacks<T> {
    onFailure?(transaction: Transaction)
    onSuccess?(response: T)
  }

  interface Store {
    commitUpdate(mutation: Mutation<any,any>, callbacks?: StoreUpdateCallbacks<any>)
    primeCache(query: RelayQuery, callback: (done: any, error: any)=>void)
    readQuery(query: string)
  }

  var Store: Store

  class RootContainer extends React.Component<RootContainerProps,any> {}

  interface RootContainerProps extends React.Props<RootContainer>{
    Component: RelayContainerClass<any>
    route: Route
    renderLoading?(): JSX.Element
    renderFetched?(data: any): JSX.Element
    renderFailure?(error: Error, retry: Function): JSX.Element
  }

  interface RelayProp {
    variables: any
    setVariables(variables: Object, cb?: Function)
    forceFetch(opt?: any, cb?: Function)
  }
}
