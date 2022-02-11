import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios';
import {
  ActiveView,
  AvailableView,
  SupportView,
  LoadingView,
  SearchView,
  SplashScreenView,
  ShoppingCartView,
} from '../views'
import { ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'

// Setup global csrf token
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';

// Setup global interceptor to redirect and handle 403 unauth issue 
axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error.response.status === 403) {
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
      baseRoutes.push({ path: '/connect/:app_name/:app_url', text: '', Component: SplashScreenView })
    }
    if (searchEnabled === 'false' && workspaceEnabled === 'false') {
      // route homepage to support page if both search and workspaces are disabled
      baseRoutes.push({ path: '/', text: '', Component: SupportView })
    }
    baseRoutes.push({ path: '/support', text: 'Support', Component: SupportView })
    baseRoutes.push({ path: '/cart', text: <ShoppingCartIcon />, Component: ShoppingCartView })
    return baseRoutes;
  }

  const loadEnvironmentContext = async () => {
    let response = await axios({
      method: 'GET',
      url: `${relativeHost}/static/frontend/env.json`
    })
    let context = response.data;

    // split the comma-separated string which tells ui the support section to hide
    context.hidden_support_sections = context.hidden_support_sections.split(',')
    switch (context.brand) {
      case 'braini':
        context.logo_url = 'https://raw.githubusercontent.com/helxplatform/appstore/develop/appstore/core/static/images/braini/braini-lg-gray.png'
        break;
      case 'cat':
        context.logo_url = 'https://raw.githubusercontent.com/helxplatform/appstore/2d04ee687913a03ce3cd030710a78541d6bef827/appstore/core/static/images/catalyst/bdc-logo.svg'
        break;
      case 'restartr':
        context.logo_url = 'https://raw.githubusercontent.com/helxplatform/appstore/develop/appstore/core/static/images/restartr/restartingresearch.png'
        break;
      case 'scidas':
        context.logo_url = 'https://raw.githubusercontent.com/helxplatform/appstore/develop/appstore/core/static/images/scidas/scidas-logo-sm.png'
        break;
      case 'eduhelx':
        context.logo_url = 'https://raw.githubusercontent.com/helxplatform/appstore/develop/appstore/core/static/images/eduhelx/logo.png'
        break;
      case 'heal':
        context.logo_url = 'https://raw.githubusercontent.com/helxplatform/appstore/master/appstore/core/static/images/heal/logo.png'
        break;
      case 'argus':
        context.logo_url = 'https://raw.githubusercontent.com/helxplatform/appstore/master/appstore/core/static/images/argus/argus-array-256.png'
        break;
      // display helx logo in case no brand is defined
      default:
        context.logo_url = 'https://raw.githubusercontent.com/helxplatform/appstore/master/appstore/core/static/images/helx.jpg'
    }
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
