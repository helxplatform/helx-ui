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
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('loggedInUser')));

  // call the /api/token endpoint, and store tokens in user's data model
  const loginHandler = async (credentials) => {
    console.log('Logging in...')
    let loggedInUser = JSON.parse(JSON.stringify(initialUser));

    let response = {
      "message": "Authentication successful.",
      "data": {
        "refresh_token": "samplerefreshtoken",
        "access_token": "sampleaccesstoken",
        "metadata": {
          "context": "braini",
          "branding": "BRAIN-I App Registry",
          "logo_name": "BRAIN-I_app_logo",
          "logo_path": ""
        }
      }
    }

    loggedInUser.refresh_token = response.refresh_token;
    loggedInUser.access_token = response.access_token;
    loggedInUser.username = credentials[0];
    loggedInUser.config.context = response.data.metadata.context;
    loggedInUser.config.branding = response.data.metadata.branding;
    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    environment.updateConfig(response.data.metadata.context, response.data.metadata.branding);
    //   const login_response = await axios({
    //     method: 'POST',
    //     url: `${helxAppstoreUrl}/api-token-auth/`,
    //     data:{
    //     username: credentials[0],
    //     password: credentials[1]
    //   }
    // }).then(res => {
    //     let loggedInUser = JSON.parse(JSON.stringify(initialUser));
    //     loggedInUser.refesh_token = res.data.refesh;
    //     loggedInUser.access_token = res.data.access;
    //     localStorage.setItem('refresh_token', res.data.refresh);
    //     localStorage.setItem('access_token', res.data.access);
    //     loggedInUser.username = credentials[0];
    //     setUser(loggedInUser);
    //   }).catch(e => {
    //     console.log(e);
    //     alert("Username and password does not match. Please try again.")
    //   })
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
    <AuthContext.Provider value={{ user: user, login: loginHandler, logout: logoutHandler, saveSearch: favoriteSearchHandler, updateSearchHistory }}>
      { children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

