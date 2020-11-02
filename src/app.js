import React from 'react'
import { Layout } from './components/layout'
import { ThemeProvider } from 'styled-components'
import { theme } from './theme'
import { LocationProvider, Router } from '@reach/router'
import { AuthProvider, EnvironmentProvider } from './contexts'
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
    </EnvironmentProvider>
  );
}

export default App
