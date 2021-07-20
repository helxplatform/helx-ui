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
  "brand": "heal",
  "title": "NIH HEAL Initiative",
  "logo_url": "/static/images/heal/logo.png",
  "color_scheme": { "primary": "#8a5a91", "secondary": "#505057" },
  "links": null,
  "capabilities": ["app", "search"],
  "env": {
    "REACT_APP_HELX_SEARCH_URL": process.env.REACT_APP_HELX_SEARCH_URL || 'https://helx.renci.org',
    "REACT_APP_SEMANTIC_SEARCH_ENABLED": process.env.REACT_APP_SEMANTIC_SEARCH_ENABLED || 'true',
    "REACT_APP_WORKSPACES_ENABLED": process.env.REACT_APP_WORKSPACES_ENABLED || 'true'
  }
}

export const EnvironmentProvider = ({ children }) => {
  const relativeHost = window.location.origin;
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [context, setContext] = useState({});
  const [isLoadingContext, setIsLoadingContext] = useState(true);

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
    const context_response = await axios({
      method: 'GET',
      url: `${relativeHost}/api/v1/context`
    })
    setContext(context_response.data);
    setIsLoadingContext(false);
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      setContext(devContext);
      setIsLoadingContext(false);
    }
    else {
     loadContext();
    }
  }, [relativeHost])

  useEffect(() => {
    if (Object.keys(context).length !== 0) {
      const routes = generateRoutes(context["env"].REACT_APP_SEMANTIC_SEARCH_ENABLED, context["env"].REACT_APP_WORKSPACES_ENABLED);
      setAvailableRoutes(routes);
    }
  }, [context])

  if(isLoadingContext) return <LoadingView />

  return (
    <EnvironmentContext.Provider value={{
      helxAppstoreUrl: window.location.origin,
      context: context,
      routes: availableRoutes,
      isLoadingContext
    }}>
      {children}
    </EnvironmentContext.Provider>
  )
}

export const useEnvironment = () => useContext(EnvironmentContext)
