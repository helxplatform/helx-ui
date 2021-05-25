import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { useRegistry } from '../hooks'

export const EnvironmentContext = createContext({})

const commonContext = {
  "name": "HeLx Common App Registry",
  "apps": {
    "cloud-top": {
      "name": "Cloud Top",
      "spec": "${catalyst_apps}/cloud-top/docker-compose.yaml",
      "icon": "${catalyst_apps}/cloud-top/icon.png",
      "description": "CloudTop is a cloud native, browser accessible Linux desktop.",
      "details": "A Ubuntu graphical desktop environment for experimenting with native applications in the cloud.",
      "docs": "https://helxplatform.github.io/cloudtop-docs/",
      "services": {
        "cloud-top": 8080
      }
    },
    "jupyter-ds": {
      "name": "Jupyter Data Science",
      "description": "Jupyter DataScience - A Jupyter notebook for exploring and visualizing data.",
      "details": "Includes R, Julia, and Python.",
      "docs": "https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html#jupyter-datascience-notebook",
      "services": {
        "jupyter-ds": "8888"
      }
    }
  }
}

export const EnvironmentProvider = ({ children }) => {
  const [context, setContext] = useState();
  const relativeHost = window.location.origin;

  // update the context on initial render
  const loadContext = async () => {
    setContext(commonContext);
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
      helxAppstoreCsrfToken: csrfToken,
    }}>
      { children}
    </EnvironmentContext.Provider>
  )
}

export const useEnvironment = () => useContext(EnvironmentContext)
