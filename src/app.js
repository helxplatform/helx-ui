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

const notificationColors = {
  info: theme.color.info,
  success: theme.color.success,
  error: theme.color.danger,
  warning: theme.color.warning,
}

const App = () => {
  return (
    <EnvironmentProvider>
      <Notifications colors={ notificationColors }>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <LocationProvider>
              <Layout>
                <Router>
                  <Home path="/" />
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
