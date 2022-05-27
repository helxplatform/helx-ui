import { useEffect } from 'react'
import { LocationProvider, Router as ReachRouter, globalHistory, useLocation } from '@reach/router'
import { EnvironmentProvider, ActivityProvider, AppProvider, InstanceProvider, AnalyticsProvider, useEnvironment, useAnalytics } from './contexts'
import { Layout } from './components/layout'
import { NotFoundView } from './views'

const ContextProviders = ({ children }) => {
  return (
    <EnvironmentProvider>
      <LocationProvider>
        <AnalyticsProvider>
          <ActivityProvider>
            <InstanceProvider>
              <AppProvider>
                {children}
              </AppProvider>
            </InstanceProvider>
          </ActivityProvider>
        </AnalyticsProvider>
      </LocationProvider>
    </EnvironmentProvider >
  )
}

const Router = () => {
  const { context, routes } = useEnvironment();
  const { analytics, analyticsEvents } = useAnalytics();
  const location = useLocation();
  const baseRouterPath = context.workspaces_enabled === 'true' ? '/helx' : '/'

  // Component mount
  useEffect(() => {
    globalHistory.listen(({ location }) => {
      analyticsEvents.trackLocation(location);
    });
    // Track the initial location on page load (not captured in `globalHistory.listen`).
    analyticsEvents.trackLocation(location);

    // Component unmount
    return () => {
      analytics.teardown();
    }
  }, []);

  return (
    <ReachRouter basepath={baseRouterPath} className="routing-container">
      {routes !== undefined && routes.map(({ path, text, Component }) => <Component key={path} path={path}></Component>)}
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
