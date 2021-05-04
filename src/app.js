import React from 'react'
import { Layout } from './components/layout'
import { ThemeProvider } from 'styled-components'
import { theme } from './theme'
import { LocationProvider, Router } from '@reach/router'
import { AuthProvider, EnvironmentProvider, InstanceProvider } from './contexts'
import {
  About,
  Apps,
  Workspaces,
  Search,
  Account,
  Branding,
  NotFound
} from './views'
import { Available } from './views/available'
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
                      <Workspaces path="/helx/workspaces" />
                      <Account path="/helx/account" />
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
