import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios';

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

export const EnvironmentProvider = ({ children }) => {
  const [context, setContext] = useState();
  const [searchEnabled, setSearchEnabled] = useState('false');
  const [searchUrl, setSearchUrl] = useState();
  const [workspaceEnabled, setWorkspaceEnabled] = useState('false');
  const relativeHost = window.location.origin;

  useEffect(() => {
    // update the context on initial render
    const loadContext = async () => {
      const context_response = await axios({
        method: 'GET',
        url: `https://helx.zbo.blackbalsam-cluster.edc.renci.org/api/v1/context`
      })
      setContext(context_response.data);
      setSearchEnabled(context_response.data.env.REACT_APP_SEMANTIC_SEARCH_ENABLED);
      setWorkspaceEnabled(context_response.data.env.REACT_APP_WORKSPACES_ENABLED);
      setSearchUrl(context_response.data.env.REACT_APP_HELX_SEARCH_URL);
    }
    loadContext();
  }, [relativeHost])

  return (
    <EnvironmentContext.Provider value={{
      helxSearchUrl: searchUrl,
      helxAppstoreUrl: window.location.origin,
      searchEnabled: searchEnabled,
      workspacesEnabled: workspaceEnabled,
      context: context,
    }}>
      { children}
    </EnvironmentContext.Provider>
  )
}

export const useEnvironment = () => useContext(EnvironmentContext)
