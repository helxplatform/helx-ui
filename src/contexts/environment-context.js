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

  // update the context on initial render
  const loadContext = async () => {
    const context_response = await axios({
      method: 'GET',
      url: `${relativeHost}/api/v1/context`
    })
    setContext(context_response.data);
  }

  useEffect(() => {
    loadContext();
  }, [])

  return (
    <EnvironmentContext.Provider value={{
      helxSearchUrl: process.env.REACT_APP_HELX_SEARCH_URL,
      helxAppstoreUrl: window.location.origin,
      context: context,
    }}>
      { children}
    </EnvironmentContext.Provider>
  )
}

export const useEnvironment = () => useContext(EnvironmentContext)
