import { LocationProvider, Router } from '@reach/router'
import { AppProvider, EnvironmentProvider, InstanceProvider } from './contexts'
import {
  AboutView,
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
              <AboutView path="/about" />
              <AvailableView path="/workspaces" />
              <AvailableView path="/workspaces/available" />
              <ActiveView path="/workspaces/active" />
              <DocumentationView path="/documentation" />
              <ContactView path="/contact" />
              <SemanticSearchView path="/search" />
              <NotFoundView default />
            </Router>
          </Layout>
        </InstanceProvider>
      </AppProvider>
    </EnvironmentProvider >
  )
}
