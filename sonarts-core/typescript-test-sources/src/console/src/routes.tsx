import * as cookiestore from 'cookiestore'
import * as React from 'react'
import * as Relay from 'react-relay'
import { Route, IndexRoute, IndexRedirect, Redirect } from 'react-router'
import Loading from './components/Loading/Loading'
import RedirectOnMount from './components/RedirectOnMount/RedirectOnMount'
import ActionsView from './views/ActionsView/ActionsView'
import AuthView from './views/AuthView/AuthView'
import CLIAuthView from './views/CLIAuthView/CLIAuthView/CLIAuthView'
import CLIAuthSuccessInitView from './views/CLIAuthView/CLIAuthSuccessInitView/CLIAuthSuccessInitView'
import CLIAuthSuccessView from './views/CLIAuthView/CLIAuthSuccessView'
import ProjectRootView from './views/ProjectRootView/ProjectRootView'
import RootRedirectView from './views/ProjectRootView/RootRedirectView'
import TokenRedirectView from './views/ProjectRootView/TokenRedirectView'
import ProjectSettingsView from './views/ProjectSettingsView/ProjectSettingsView'
import RootView from './views/RootView/RootView'
import AfterSignUpView from './views/AfterSignUpView/AfterSignUpView'
import AccountView from './views/account/AccountView/AccountView'
import SettingsTab from './views/account/AccountView/SettingsTab'
import ResetPasswordView from './views/account/ResetPasswordView/ResetPasswordView'
import DatabrowserView from './views/models/DatabrowserView/DatabrowserView'
import Settings from './views/Settings/Settings'
import General from './views/Settings/General/General'
import Authentication from './views/Settings/Authentication/Authentication'
import Export from './views/Settings/Export/Export'
import Team from './views/Settings/Team/Team'
import Billing from './views/Settings/Billing/Billing'
import ModelRedirectView from './views/models/ModelRedirectView'
import FieldPopup from './views/models/FieldPopup/FieldPopup'
import AuthProviderPopup from './views/models/AuthProviderPopup/AuthProviderPopup'
import PlaygroundView from './views/playground/PlaygroundView/PlaygroundView'
import PermissionsView from './views/PermissionsView/PermissionsView'
import { EditPermissionPopup, AddPermissionPopup } from './views/PermissionsView/PermissionPopup/PermissionPopup'
import {
  EditRelationPermissionPopup,
  AddRelationPermissionPopup,
} from './views/PermissionsView/RelationPermissionPopup/RelationPermissionPopup'
import CloneProjectPopup from './views/ProjectRootView/CloneProjectPopup'
import AlgoliaView from './views/Integrations/Algolia/AlgoliaView'
import ShowRoom from './views/ShowRoom/ShowRoom'
import IntegrationsView from './views/Integrations/IntegrationsView'
import tracker from './utils/metrics'
import { ConsoleEvents } from 'graphcool-metrics'
import RelationPopup from './views/RelationsPopup/RelationPopup'
import ChangePricingPlan from './views/Settings/Billing/ChangePricingPlan'
import ConfirmPricingPlan from './views/Settings/Billing/ConfirmPricingPlan'
import ImportSchemaView from './views/ImportSchemaView/ImportSchemaView'
import NewSchemaView from './views/SchemaView/SchemaView'
import SchemaViewer from './views/SchemaView/SchemaViewer'
import AllRelationPermissionsList from './views/PermissionsView/RelationPermissionsList/AllRelationPermissionsList'
import PermissionsList from './views/PermissionsView/PermissionsList/PermissionsList'
import FunctionsView from './views/FunctionsView/FunctionsView'
import { CreateFunctionPopup, EditFunctionPopup } from './views/FunctionsView/FunctionPopup/FunctionPopup'
import { FunctionLogs } from './views/FunctionsView/FunctionLogs/FunctionLogs'

const ViewerQuery = {
  viewer: (Component, variables) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('viewer', variables)}
      }
    }
  `,
}

const NodeQuery = {
  node: (Component, variables) => Relay.QL`
    query {
      node: node(id: $id) {
        ${Component.getFragment('node', variables)}
      }
    }
  `,
}

/**
 * Looks in the route and in parent routes for a loadingColor property
 * @param routes
 * @returns {string}
 */
function getLoadingColor(routes) {
  const stack = routes.slice()
  let color = null
  while (stack.length > 0 && color === null) {
    const route = stack.pop()
    if (route.hasOwnProperty('loadingColor')) {
      color = route['loadingColor']
    }
  }
  return color !== null ? color : '#8989B1'
}

/* eslint-disable react/prop-types */
const render = ({error, props, routerProps, element, ...rest}) => {
  if (error) {
    if (error.message && error.message === 'Failed to fetch' && location.pathname === '/') {
      cookiestore.remove('graphcool_auth_token')
      cookiestore.remove('graphcool_customer_id')
      window.location.pathname = '/'
      return null
    }

    const err = error.source.errors[0]

    tracker.track(ConsoleEvents.unexpectedError({error: JSON.stringify(err)}))

    if (err.code === 2001) {
      cookiestore.remove('graphcool_auth_token')
      cookiestore.remove('graphcool_customer_id')
      tracker.reset()

      return (
        <RedirectOnMount to='/login'/>
      )
    }

    if (routerProps && routerProps.params.projectName && routerProps.params.modelName) {
      // if we have a model and a project, there might be only a problem with the model, so redirect to project
      return (
        <RedirectOnMount to={`/${routerProps.params.projectName}`}/>
      )
    }

    return (
      // TODO https://github.com/relay-tools/react-router-relay/issues/156
      <RedirectOnMount to='/'/>
    )
  }

  if (props) {
    return React.cloneElement(element, props)
  }

  const color = getLoadingColor(routerProps.routes)

  return (
    <div className='loader'>
      <style jsx>{`
        .loader {
          @p: .top0, .left0, .right0, .bottom0, .fixed, .flex, .justifyCenter, .itemsCenter, .z999;
        }
      `}</style>
      <Loading color={color}/>
    </div>
  )
}

export default (
  <Route path='/' component={RootView}>
    <IndexRoute component={RootRedirectView} queries={ViewerQuery} render={render}/>
    <Route path='token' component={TokenRedirectView}/>
    <Route path='cli/auth' component={CLIAuthView} onEnter={CLIAuthView.routeRedirectWhenAuthenticated}/>
    <Route path='cli/auth/success' component={CLIAuthSuccessView}/>
    <Route path='cli/auth/success-init' component={CLIAuthSuccessInitView}/>
    <Route path='reset-password' component={ResetPasswordView}/>
    <Route path='signup' component={() => <AuthView initialScreen='signUp'/>}/>
    <Route path='login' component={() => <AuthView initialScreen='login'/>}/>
    <Route path='after-signup' component={AfterSignUpView} queries={ViewerQuery} render={render}/>
    <Route path='showroom' component={ShowRoom}/>
    <Route path=':projectName' component={ProjectRootView} queries={ViewerQuery} render={render}>
      <IndexRedirect to='schema'/>
      <Redirect from='settings' to='settings/general'/>
      <Route path='token' component={TokenRedirectView}/>
      <Route path='settings' component={Settings} render={render}>
        <Route path='general' component={General} queries={ViewerQuery} render={render}/>
        <Route path='authentication' component={Authentication} queries={ViewerQuery} render={render}/>
        <Route path='export' component={Export} queries={ViewerQuery} render={render}/>
        <Route path='billing' component={Billing} queries={ViewerQuery} render={render}>
          <Route path='change-plan/:plan' component={ChangePricingPlan} render={render}/>
          <Route path='confirm-plan/:plan' component={ConfirmPricingPlan} queries={ViewerQuery} render={render}/>
        </Route>
        <Route path='team' component={Team} queries={ViewerQuery} render={render}/>
      </Route>
      <Route path='clone' component={CloneProjectPopup} queries={ViewerQuery} render={render}/>
      <Route path='functions' component={FunctionsView} queries={ViewerQuery} render={render}>
        <Route path='create' component={CreateFunctionPopup} queries={ViewerQuery} render={render}/>
        <Route
          path=':id/logs'
          component={FunctionLogs}
          queries={{node: NodeQuery.node, viewer: ViewerQuery.viewer}}
          render={render}
        />
        <Route
          path=':id/edit'
          component={EditFunctionPopup}
          queries={{node: NodeQuery.node, viewer: ViewerQuery.viewer}}
          render={render}
        />
      </Route>
      <Route path='account' component={AccountView} queries={ViewerQuery} render={render}>
        <Route path='settings' component={SettingsTab} queries={ViewerQuery} render={render}/>
        <IndexRedirect to='settings'/>
      </Route>
      <Route path='schema' component={NewSchemaView} queries={ViewerQuery} render={render} loadingColor='white'>
        <Route path='all' component={null} render={render}/>
        <Route path='types' component={null} render={render}/>
        <Route path='interfaces' component={null} render={render}/>
        <Route path='enums' component={null} render={render}>
          <Route path='edit/:enumName' component={null} render={render}/>
        </Route>
        <Route path='relations'>
          <Route path='create' component={RelationPopup} queries={ViewerQuery} render={render}/>
          <Route path='edit/:relationName' component={RelationPopup} queries={ViewerQuery} render={render}/>
        </Route>
        <Route path=':modelName'>
          <Route path='edit' component={null} render={render}/>
          <Route path='edit/:fieldName' component={FieldPopup} queries={ViewerQuery} render={render}/>
          <Route path='create' component={FieldPopup} queries={ViewerQuery} render={render}/>
        </Route>
      </Route>
      <Route path='graph-view' component={SchemaViewer} queries={ViewerQuery} render={render}/>
      <Route path='models'>
        <IndexRoute component={ModelRedirectView} queries={ViewerQuery} render={render}/>
        <Route path=':modelName/databrowser' component={DatabrowserView} queries={ViewerQuery} render={render}/>
        <Route path=':modelName' component={ModelRedirectView} queries={ViewerQuery} render={render}/>
      </Route>
      <Route path='permissions' component={PermissionsView} queries={ViewerQuery} render={render}>
        <IndexRoute component={PermissionsList}/>
        <Route path='relations' component={AllRelationPermissionsList}>
          <Route
            path=':relationName/edit/:id'
            component={EditRelationPermissionPopup}
            queries={{node: NodeQuery.node, viewer: ViewerQuery.viewer}}
            render={render}
          />
          <Route
            path=':relationName/create'
            component={AddRelationPermissionPopup}
            queries={ViewerQuery}
            render={render}
          />
        </Route>
        <Route component={PermissionsList}>
          <Route
            path=':modelName/edit/:id'
            component={EditPermissionPopup}
            queries={{node: NodeQuery.node, viewer: ViewerQuery.viewer}}
            render={render}
          />
          <Route path=':modelName/create' component={AddPermissionPopup} queries={ViewerQuery} render={render}/>
        </Route>
      </Route>
      <Route path='actions' component={ActionsView} queries={ViewerQuery} render={render}/>
      <Route path='playground' component={PlaygroundView} queries={ViewerQuery} render={render}/>
      <Route path='settings' component={ProjectSettingsView} queries={ViewerQuery} render={render}/>
      <Route path='algolia' component={AlgoliaView} queries={ViewerQuery} render={render}/>
      <Route path='integrations' component={IntegrationsView} queries={ViewerQuery} render={render}>
        <Route path='authentication/:provider' component={AuthProviderPopup} queries={ViewerQuery} render={render}/>
      </Route>
    </Route>
  </Route>
)
