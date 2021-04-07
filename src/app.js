import React from 'react'
import { Layout } from './components/layout'
import { ThemeProvider } from 'styled-components'
import { theme } from './theme'
import { LocationProvider, Router } from '@reach/router'
import { AuthProvider, EnvironmentProvider } from './contexts'
import { Notifications } from './components/notifications'
import {
  Home,
  Apps,
  Search,
  Account,
  Branding,
  NotFound
} from './views'

const App = () => {
  return (
    <EnvironmentProvider>
      <Notifications>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <LocationProvider>
              <Layout>
                <Router>
                  <Home path="/frontend/react" />
                  <Apps path="/apps" />
                  <Account path="/account" />
                  <Search path="/search/*" />
                  <Branding path="/branding" />
                  <NotFound default />
                </Router>
              </Layout>
            </LocationProvider>
          </ThemeProvider>
        </AuthProvider>
      </Notifications>
    </EnvironmentProvider>
  );
}

export default App
