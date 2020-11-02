import React, { createContext, useContext, useState } from 'react'
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

  return (
    <EnvironmentContext.Provider value={{
      helxSearchUrl: process.env.REACT_APP_HELX_SEARCH_URL,
      helxAppstoreUrl: process.env.REACT_APP_HELX_APPSTORE_URL,
      config: config,
      updateConfig: updateConfig
    }}>
      { children}
    </EnvironmentContext.Provider>
  )
}

export const useEnvironment = () => useContext(EnvironmentContext)
