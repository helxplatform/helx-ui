import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios';
import {
  ActiveView,
  AvailableView,
  SupportView,
  LoadingView,
  SearchView,
} from '../views'

// Setup global csrf token
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';

// Setup global interceptor to redirect and handle 403 unauth issue 
axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error.response.status === 403) {
    window.location.href = window.location.origin + '/helx/login'
  }
  return Promise.reject(error)
})

export const EnvironmentContext = createContext({})

let devContext = {
  "brand": process.env.REACT_APP_UI_BRAND_NAME || 'heal',
  "title": "NIH HEAL Initiative",
  "logo_url": process.env.REACT_APP_UI_BRAND_LOGO || 'https://github.com/helxplatform/appstore/blob/master/appstore/core/static/images/heal/logo.png?raw=true',
  "color_scheme": { "primary": "#8a5a91", "secondary": "#505057" },
  "links": null,
  "WORKSPACES_ENABLED": "true",
  "SEARCH_ENABLED": "true",
  "SEARCH_URL": "",
  "search_url": "https://helx.renci.org",
  "search_enabled": "true",
  "workspaces_enabled": "false"
}

export const EnvironmentProvider = ({ children }) => {
  const relativeHost = window.location.origin;
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [context, setContext] = useState({});
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [basePath, setBasePath] = useState(process.env.REACT_APP_HELX_APPSTORE_ENABLED === 'true' ? '/helx/' : '/');

  const generateRoutes = (searchEnabled, workspaceEnabled) => {
    console.log("generate Routes")
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
    }
    if (searchEnabled === 'false' && workspaceEnabled === 'false') {
      // route homepage to support page if both search and workspaces are disabled
      baseRoutes.push({ path: '/', text: '', Component: SupportView })
    }
    baseRoutes.push({ path: '/support', text: 'Support', Component: SupportView })
    return baseRoutes;
  }

  const loadContext = async () => {
    let context_response = await axios({
      method: 'GET',
      url: `${relativeHost}/api/v1/context`
    })
    context_response.data.logo_url = window.location.origin + context_response.data.logo_url
    setContext(context_response.data);
    setIsLoadingContext(false);
  }

  const loadEnvironmentContext = async () => {
    let response = await axios({
      method: 'GET',
      url: `${relativeHost}/env.json`
    })
    let context = response.data;
    console.log(context);
    setContext(context);
    setIsLoadingContext(false);
  }

  useEffect(() => {
    loadEnvironmentContext()
  }, [relativeHost])

  useEffect(() => {
    if (Object.keys(context).length !== 0) {
      const routes = generateRoutes(context.search_enabled, context.workspaces_enabled);
      setAvailableRoutes(routes);
    }
  }, [context])

  if(isLoadingContext) return <LoadingView />

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
