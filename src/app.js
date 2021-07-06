import { Fragment } from 'react'
import { LocationProvider, Router } from '@reach/router'
import { ActivityProvider, AppProvider, EnvironmentProvider, InstanceProvider } from './contexts'
import {
  ActiveView,
  AvailableView,
  SupportView,
  NotFoundView,
  SearchView,
} from './views'
import { Layout } from './components/layout'

const renderSearchModule = () => {
  if (process.env.REACT_APP_SEMANTIC_SEARCH_ENABLED === 'true') {
    return <SearchView path="/search" />
  }
}

const renderWorkspacesModule = () => {
  if (process.env.REACT_APP_WORKSPACES_ENABLED === 'true') {
    return <Fragment>
      <AvailableView path="/workspaces" />
      <AvailableView path="/workspaces/available" />
      <ActiveView path="/workspaces/active" />
    </Fragment>
  }
}

const routeHomepage = () => {
  if (process.env.REACT_APP_SEMANTIC_SEARCH_ENABLED === 'false') {
    if (process.env.REACT_APP_WORKSPACES_ENABLED === 'true') {
      return <AvailableView path="/" />
    }
    else {
      return <SupportView path="/" />
    }
  }
  else {
    return <SearchView path="/" />
  }
}

export const App = () => {
  return (
    <EnvironmentProvider>
      <LocationProvider>
        <ActivityProvider>
          <AppProvider>
            <InstanceProvider>
              <Layout>
                <Router basepath="/helx">
                  <SupportView path="/support" />
                  {renderSearchModule()}
                  {renderWorkspacesModule()}
                  {routeHomepage()}
                  <NotFoundView default />
                </Router>
              </Layout>
            </InstanceProvider>
          </AppProvider>
        </ActivityProvider>
      </LocationProvider>
    </EnvironmentProvider >
  )
}
