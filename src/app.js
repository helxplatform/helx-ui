import { LocationProvider, Router } from '@reach/router'
import { AppProvider, EnvironmentProvider, InstanceProvider } from './contexts'
import {
  ActiveView,
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
      <AppProvider>
        <InstanceProvider>
          <Layout>
            <Router basepath="/helx">
              <AvailableView path="/workspaces" />
              <AvailableView path="/workspaces/available" />
              <ActiveView path="/workspaces/active" />
              <DocumentationView path="/documentation" />
              <ContactView path="/contact" />
              <SemanticSearchView path="/" />
              <SemanticSearchView path="/search" />
              <NotFoundView default />
            </Router>
          </Layout>
        </InstanceProvider>
      </AppProvider>
    </EnvironmentProvider >
  )
}
