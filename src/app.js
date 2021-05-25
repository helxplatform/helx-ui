import { LocationProvider, Router } from '@reach/router'
import { AuthProvider, EnvironmentProvider } from './contexts'
import {
  AboutView,
  ContactView,
  DocumentationView,
  NotFoundView,
  SemanticSearchView,
  WorkspacesView,
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
              <WorkspacesView path="/workspaces" />
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
