import { LocationProvider, Router as ReachRouter } from '@reach/router'
import { EnvironmentProvider, ActivityProvider, AppProvider, InstanceProvider, useEnvironment } from './contexts'
import { Layout } from './components/layout'
import { NotFoundView } from './views'
import { useEffect } from 'react'

const ContextProviders = ({ children }) => {
  return (
    <EnvironmentProvider>
      <LocationProvider>
        <ActivityProvider>
          <AppProvider>
            <InstanceProvider>
              {children}
            </InstanceProvider>
          </AppProvider>
        </ActivityProvider>
      </LocationProvider>
    </EnvironmentProvider >
  )
}

const Router = () => {
  const { routes } = useEnvironment();
  const baseRouterPath = process.env.REACT_APP_HELX_APPSTORE_ENABLED === 'true' ? '/helx' : '/'
  
  return (
    <ReachRouter basepath={baseRouterPath}>
      {routes !== undefined && routes.map(({ path, text, Component }) => <Component path={path}></Component>)}
      <NotFoundView default />
    </ReachRouter>
  )
}

export const App = () => {
  const { routes } = useEnvironment();
  return (
    <ContextProviders>
      <Layout>
        <Router />
      </Layout>
    </ContextProviders>
  )
}
