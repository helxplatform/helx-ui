import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRegistry } from '../hooks'

export const EnvironmentContext = createContext({})

export const EnvironmentProvider = ({ children }) => {
  //const { context } = useRegistry(process.env.REACT_APP_CONTEXT)

  // initial configuration settings before login
  const initialConfig = {
    context: 'commonshare',
    branding: 'HeLx Common App Registry'
  }

  const [config, setConfig] = useState(localStorage.getItem('loggedInUser') === null ? initialConfig : JSON.parse(localStorage.getItem('loggedInUser')).config);

  // update the config after login
  const updateConfig = (ctx, brd) => {
    setConfig({
      context: ctx,
      branding: brd
    })
  }

  // store csrf token
  const [csrfToken, setCsrfToken] = useState();

  useEffect(() => {
    if (document.cookie && document.cookie !== '') {
      let cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        let trimmedCookies = cookies[i].trim();
        if(trimmedCookies.substring(0,10) === 'csrftoken='){
            setCsrfToken(trimmedCookies.substring(10))
        }
      }
    }
  })

  return (
    <EnvironmentContext.Provider value={{
      helxSearchUrl: process.env.REACT_APP_HELX_SEARCH_URL,
      helxAppstoreUrl: process.env.REACT_APP_HELX_APPSTORE_URL,
      config: config,
      updateConfig: updateConfig,
      csrfToken
    }}>
      { children}
    </EnvironmentContext.Provider>
  )
}

export const useEnvironment = () => useContext(EnvironmentContext)
