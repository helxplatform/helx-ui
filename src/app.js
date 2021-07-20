import { LocationProvider, Router as ReachRouter } from '@reach/router'
import { EnvironmentProvider, ActivityProvider, AppProvider, InstanceProvider, useEnvironment } from './contexts'
import { Layout } from './components/layout'
import { NotFoundView } from './views'

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
  
  return (
    <ReachRouter basepath="/helx">
      {routes !== undefined && routes.map(({ path, text, Component }) => <Component path={path}>{console.log(Component)}</Component>)}
      <NotFoundView default />
    </ReachRouter>
  )
}

export const App = () => {
  return (
    <ContextProviders>
      <Layout>
        <Router />
      </Layout>
    </ContextProviders>
  )
}
