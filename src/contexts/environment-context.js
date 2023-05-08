import React, { createContext, useContext, useEffect, useState } from 'react'
import axios, { CanceledError } from 'axios';
import {
  ActiveView,
  AvailableView,
  WorkspaceLoginView,
  LoginSuccessRedirectView,
  SupportView,
  LoadingView,
  SearchView,
  SplashScreenView,
  WorkspaceSignupView,
} from '../views'

// Setup global csrf token
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';

// Setup global interceptor to redirect and handle 403 unauth issue 
axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error instanceof CanceledError) {
    // The `error` object for cancelled requests does not have a `response` property.
  }
  else if (error.response.status === 403) {
    // window.location.href = window.location.origin + '/helx/login/';
  }
  return Promise.reject(error)
})

export const EnvironmentContext = createContext({})

export const EnvironmentProvider = ({ children }) => {
  const relativeHost = window.location.origin;
  const isProduction = process.env.NODE_ENV !== 'development'
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [context, setContext] = useState({});
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [basePath, setBasePath] = useState('/');

  // Routes are generated dynamically based on search and workspace configuration. 
  // If workspace module is enabled, all relevant paths will be added. (/workspaces/active, workspace/available, ...)
  // Note: `parent` property refers to another equivalent or encapsulating route that occupies an entry in the site's header.
  // It's important to include this if applicable so that the header entry stays active, e.g. on subroutes of workspaces.
  const generateRoutes = (searchEnabled, workspaceEnabled) => {
    const baseRoutes = [];
    if (searchEnabled === 'true') {
      // route homepage to search if search is enabled
      baseRoutes.push({ path: '/', parent: '/search', text: '', Component: SearchView })
      baseRoutes.push({ path: '/search', text: 'Search', Component: SearchView })
    }
    if (workspaceEnabled === 'true') {
      // route homepage to apps page if search is disabled
      if (searchEnabled === 'false') {
        baseRoutes.push({ path: '/', parent: '/workspaces', text: '', Component: AvailableView })
      }
      baseRoutes.push({ path: '/workspaces', text: 'Workspaces', Component: AvailableView })
      baseRoutes.push({ path: '/workspaces/login', parent: '/workspaces', text: '', Component: WorkspaceLoginView })
      baseRoutes.push({ path: '/workspaces/login/success', parent: '/workspaces', text: '', Component: LoginSuccessRedirectView })
      baseRoutes.push({ path: '/workspaces/signup/social', parent: '/workspaces', text: '', Component: WorkspaceSignupView })
      baseRoutes.push({ path: '/workspaces/available', parent: '/workspaces', text: '', Component: AvailableView })
      baseRoutes.push({ path: '/workspaces/active', parent: '/workspaces', text: '', Component: ActiveView })
      baseRoutes.push({ path: '/connect/:app_name/:app_url', parent: '/workspaces', text: '', Component: SplashScreenView })
    }
    if (searchEnabled === 'false' && workspaceEnabled === 'false') {
      // route homepage to support page if both search and workspaces are disabled
      baseRoutes.push({ path: '/', parent: '/support', text: '', Component: SupportView })
    }
    baseRoutes.push({ path: '/support', text: 'Support', Component: SupportView })
    return baseRoutes;
  }

  useEffect(() => {
    // fetch env.json for environment configuration
    const loadEnvironmentContext = async () => {
      let response = await axios({
        method: 'GET',
        url: `${relativeHost}/static/frontend/env.json`
      })
      let context = response.data;

      /** Context defaults */
      if (!context.appstore_asset_branch) context.appstore_asset_branch = "master"
      if (!context.brand) context.brand = "helx"

      // split the comma-separated string which tells ui the support section to hide
      // also trim leading/trailing spaces to allow spaces between commas
      context.hidden_support_sections = context.hidden_support_sections.split(',').map((section) => section.trim())
      context.hidden_result_tabs = context.hidden_result_tabs.split(',').map((tab) => tab.trim())

      // Make sure the tranql_url ends with a slash. If it doesn't, it will redirect, which breaks the iframe for some reason. 
      if (!context.tranql_url.endsWith("/")) context.tranql_url += "/"

      // logos for different brands. Use the helx logo if no brand has been specified.
      let brandAssetFolder = context.brand
      // `catalyst` is the supported name, but support `cat` and `bdc` as well.
      if (brandAssetFolder === "cat" || brandAssetFolder === "bdc") brandAssetFolder = "bdc"
      context.logo_url = `https://raw.githubusercontent.com/helxplatform/appstore/${ context.appstore_asset_branch }/appstore/core/static/images/${ brandAssetFolder }/logo.png`
      setContext(context);
      setIsLoadingContext(false);
    }
    loadEnvironmentContext()
  }, [relativeHost])

  // If workspace is enabled, all routes should have a '/helx' basePath as the ui is embedded in the appstore
  useEffect(() => {
    if (Object.keys(context).length !== 0) {
      const routes = generateRoutes(context.search_enabled, context.workspaces_enabled);
      setAvailableRoutes(routes);
      if (context.workspaces_enabled === 'true') {
        setBasePath('/helx/');
      }
      else {
        setBasePath('/');
      }
    }
  }, [context])

  if (isLoadingContext) return <LoadingView />

  return (
    <EnvironmentContext.Provider value={{
      helxSearchUrl: context.search_url,
      helxAppstoreUrl: isProduction ? window.location.origin : "http://localhost:8000",
      context: context,
      routes: availableRoutes,
      isProduction,
      basePath,
      isLoadingContext
    }}>
      {children}
    </EnvironmentContext.Provider>
  )
}

export const useEnvironment = () => useContext(EnvironmentContext)
