import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { useRegistry } from '../hooks'

export const EnvironmentContext = createContext({})

export const EnvironmentProvider = ({ children }) => {
  const [context, setContext] = useState();
  const relativeHost = window.location.origin;

  // update the context on initial render
  const loadContext = async () => {
    const context_response = await axios({
      method: 'GET',
      url: `${relativeHost}/api/v1/context`
    })
    setContext(context_response.data);
  }

  // load csrf token from getCookie
  const loadCsrfToken = () => {
    if (document.cookie && document.cookie !== '') {
      let cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        let trimmedCookies = cookies[i].trim();
        if (trimmedCookies.substring(0, 10) === 'csrftoken=') {
          setCsrfToken(trimmedCookies.substring(10))
        }
      }
    }
  }

  // store csrf token
  const [csrfToken, setCsrfToken] = useState();

  useEffect(() => {
    loadContext();
    loadCsrfToken();
  }, [])

  return (
    <EnvironmentContext.Provider value={{
      helxSearchUrl: process.env.REACT_APP_HELX_SEARCH_URL,
      helxAppstoreUrl: window.location.origin,
      context: context,
      helxAppstoreCsrfToken: csrfToken
    }}>
      { children}
    </EnvironmentContext.Provider>
  )
}

export const useEnvironment = () => useContext(EnvironmentContext)
