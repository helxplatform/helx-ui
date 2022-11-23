import React, { createContext, useContext, useEffect, useState } from 'react'
import axios, { CanceledError } from 'axios';
import {
  ActiveView,
  AvailableView,
  SupportView,
  LoadingView,
  SearchView,
  SplashScreenView
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
    window.location.href = window.location.origin + '/helx/login/';
  }
  return Promise.reject(error)
})

export const EnvironmentContext = createContext({})

export const EnvironmentProvider = ({ children }) => {
  const relativeHost = window.location.origin;
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [context, setContext] = useState({});
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [basePath, setBasePath] = useState('/');

  // Routes are generated dynamically based on search and workspace configuration. 
  // If workspace module is enabled, all relevant paths will be added. (/workspaces/active, workspace/available, ...)

  const generateRoutes = (searchEnabled, workspaceEnabled) => {
    const baseRoutes = [];
    if (searchEnabled === 'true') {
      // route homepage to search if search is enabled
      baseRoutes.push({ path: '/', text: '', Component: SearchView })
      baseRoutes.push({ path: '/search', text: 'Search', Component: SearchView })
    }
    if (workspaceEnabled === 'true') {
      // route homepage to apps page if search is disabled
      if (searchEnabled === 'false') {
        baseRoutes.push({ path: '/', text: '', Component: AvailableView })
      }
      baseRoutes.push({ path: '/workspaces', text: 'Workspaces', Component: AvailableView })
      baseRoutes.push({ path: '/workspaces/available', text: '', Component: AvailableView })
      baseRoutes.push({ path: '/workspaces/active', text: '', Component: ActiveView })
      baseRoutes.push({ path: '/connect/:app_name/:app_url', text: '', Component: SplashScreenView })
    }
    if (searchEnabled === 'false' && workspaceEnabled === 'false') {
      // route homepage to support page if both search and workspaces are disabled
      baseRoutes.push({ path: '/', text: '', Component: SupportView })
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
      if (!context.dockstore_branch) context.dockstore_branch = "master"
      if (!context.appstore_asset_branch) context.appstore_asset_branch = "master"
      if (!context.brand) context.brand = "helx"

      // split the comma-separated string which tells ui the support section to hide
      context.hidden_support_sections = context.hidden_support_sections.split(',')

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
      helxAppstoreUrl: window.location.origin,
      context: context,
      routes: availableRoutes,
      basePath,
      isLoadingContext
    }}>
      {children}
    </EnvironmentContext.Provider>
  )
}

export const useEnvironment = () => useContext(EnvironmentContext)
