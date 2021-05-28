import { LocationProvider, Router } from '@reach/router'
import { AppProvider, EnvironmentProvider, InstanceProvider } from './contexts'
import {
  ActiveView,
  AvailableView,
  SupportView,
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
              <SupportView path="/support" />
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
