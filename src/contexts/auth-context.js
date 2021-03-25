import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { useEnvironment } from './environment-context';

const HISTORY_SIZE = 10

export const AuthContext = createContext({})

// initialUser profile
let initialUser = {
  username: 'some user',
  email: 'email@ddr.ess',
  preferences: {
    mode: 'light',
    apps: [],
  },
  search: {
    favorites: [
      "{\"query\":\"heart\",\"page\":1}",
      "{\"query\":\"lung\",\"page\":1}",
      "{\"query\":\"blood\",\"page\":3}"
    ],
    history: [],
  },
  refresh_token: "",
  access_token: "",
  config: {
    context: "",
    branding: ""
  }
}


export const AuthProvider = ({ children }) => {
  const environment = useEnvironment();
  const helxAppstoreUrl = environment.helxAppstoreUrl;
  const [user, setUser] = useState();
  const [providers, setProviders] = useState([]);
  const [isAuth, setAuth] = useState(false)

  // load login provider

  useEffect(() => {
    loginProvider();
  }, [])

  const loginProvider = async () => {
    const provider_response = await axios({
      method: 'GET',
      url: `${helxAppstoreUrl}/api/v1/providers/`
    });
    setProviders(provider_response.data);
  }

  // call the /api/token endpoint, and store tokens in user's data model
  const loginHandler = async (url) => {
    const login_response = await axios({
      method: 'GET',
      url: `${helxAppstoreUrl}/api/v1/users/`
    }).catch(e => {
      if(e.response.status === 403){
        setAuth(false);
      }
      else{
        setAuth(true);
      }
    })

    // redirect to the provider login
    window.location.href = helxAppstoreUrl + url;
  }

  const logoutHandler = () => {
    console.log('Logging out...');
    localStorage.removeItem('loggedInUser')
    environment.updateConfig("commonshare", "HeLx Common App Registry");
    setUser(null)
  }

  const favoriteSearchHandler = (query, page) => event => {
    const searchData = JSON.stringify({ query, page })
    let newSavedSearches = [...user.search.favorites]
    const index = newSavedSearches.indexOf(searchData)
    if (index > -1) {
      // found? remove it
      newSavedSearches = [...newSavedSearches.slice(0, index), ...user.search.favorites.slice(index + 1)]
    } else {
      // not found? add it
      newSavedSearches = [...newSavedSearches, searchData]
    }
    setUser({
      ...user,
      search: {
        ...user.search,
        favorites: newSavedSearches,
      },
    })
  }

  const updateSearchHistory = query => {
    if (user) {
      const newSearchItem = {
        query: query,
        timestamp: new Date()
      }
      const newSearchHistory = [JSON.stringify(newSearchItem), ...user.search.history].slice(0, HISTORY_SIZE)
      setUser({
        ...user,
        search: {
          ...user.search,
          history: newSearchHistory,
        },
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user: user, isAuth: isAuth, providers: providers, login: loginHandler, logout: logoutHandler, saveSearch: favoriteSearchHandler, updateSearchHistory }}>
      { children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

