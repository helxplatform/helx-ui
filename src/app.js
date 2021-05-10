import React from 'react'
import { Layout } from './components/layout'
import { ThemeProvider } from 'styled-components'
import { theme } from './theme'
import { LocationProvider, Router } from '@reach/router'
import { AuthProvider, EnvironmentProvider, InstanceProvider } from './contexts'
import {
  About,
  Active,
  Available,
  Search,
  Account,
  Branding,
  NotFound
} from './views'
import { AppProvider } from './contexts/app-context'
import { Notifications } from '@mwatson/react-notifications';
import '@mwatson/react-notifications/dist/index.css';


const App = () => {
  return (
    <EnvironmentProvider>
      <Notifications>
        <AuthProvider>
          <AppProvider>
            <InstanceProvider>
              <ThemeProvider theme={theme}>
                <LocationProvider>
                  <Layout>
                    <Router>
                      <About path="/helx/about" />
                      <Account path="/helx/account" />
                      <Active path="/helx/workspaces/active" />
                      <Available path="/helx/workspaces" />
                      <Available path="/helx/workspaces/available" />
                      <Search path="/helx" />
                      <Search path="/helx/search/*" />
                      <Branding path="/helx/branding" />
                      <NotFound default />
                    </Router>
                  </Layout>
                </LocationProvider>
              </ThemeProvider>
            </InstanceProvider>
          </AppProvider>
        </AuthProvider>
      </Notifications>
    </EnvironmentProvider>
  );
}

export default App
