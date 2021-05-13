import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { contextHandler, userHandler } from '../api/api';

export const EnvironmentContext = createContext({})

export const EnvironmentProvider = ({ children }) => {
  const [context, setContext] = useState();
  const [csrfToken, setCsrfToken] = useState();
  const [timeoutSeconds, setTimeoutSeconds] = useState();
  const helxAppstoreUrl = window.location.origin;

  // update the context on initial render
  const loadContext = async () => {
    const context_response = await contextHandler(helxAppstoreUrl);
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

  // load session timeout value
  const loadTimeout = async () => {
    const user_response = await userHandler(helxAppstoreUrl);
    setTimeoutSeconds(user_response.data['SESSION_TIMEOUT']);
  }

  useEffect(() => {
    loadContext();
    loadCsrfToken();
    loadTimeout();
  }, [])

  return (
    <EnvironmentContext.Provider value={{
      helxSearchUrl: process.env.REACT_APP_HELX_SEARCH_URL,
      helxAppstoreUrl: helxAppstoreUrl,
      context: context,
      helxAppstoreCsrfToken: csrfToken,
      timeoutSeconds: 200
    }}>
      { children}
    </EnvironmentContext.Provider>
  )
}

export const useEnvironment = () => useContext(EnvironmentContext)
