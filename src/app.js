import { LocationProvider, Router as ReachRouter } from '@reach/router'
import { EnvironmentProvider, ActivityProvider, AppProvider, InstanceProvider, AnalyticsProvider, useEnvironment } from './contexts'
import { Layout } from './components/layout'
import { ShoppingCartProvider } from './components/shopping-cart'
import { NotFoundView } from './views'
import { useEffect } from 'react'

const ContextProviders = ({ children }) => {
  return (
    <EnvironmentProvider>
      <LocationProvider>
        <AnalyticsProvider>
          <ShoppingCartProvider>
            <ActivityProvider>
              <InstanceProvider>
                <AppProvider>
                  {children}
                </AppProvider>
              </InstanceProvider>
            </ActivityProvider>
          </ShoppingCartProvider>
        </AnalyticsProvider>
      </LocationProvider>
    </EnvironmentProvider >
  )
}

const Router = () => {
  const { context, routes } = useEnvironment();
  const baseRouterPath = context.workspaces_enabled === 'true' ? '/helx' : '/'

  return (
    <ReachRouter basepath={baseRouterPath}>
      {routes !== undefined && routes.map(({ path, text, Component }) => <Component key={path} path={path}></Component>)}
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
