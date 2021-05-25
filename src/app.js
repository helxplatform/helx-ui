import { LocationProvider, Router } from '@reach/router'
import { AuthProvider, EnvironmentProvider } from './contexts'
import {
  AboutView,
  AvailableView,
  ContactView,
  DocumentationView,
  NotFoundView,
  SemanticSearchView,
} from './views'
import { Layout } from './components/layout'

export const App = () => {
  return (
    <EnvironmentProvider>
      <AuthProvider>
        <LocationProvider>
          <Layout>
            <Router>
              <AboutView path="/" />
              <AboutView path="/about" />
              <AvailableView path="/workspaces" />
              <AvailableView path="/workspaces/available" />
              <DocumentationView path="/documentation" />
              <ContactView path="/contact" />
              <SemanticSearchView path="/search" />
              <NotFoundView default />
            </Router>
          </Layout>
        </LocationProvider>
      </AuthProvider>
    </EnvironmentProvider>
  )
}
