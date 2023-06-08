import { useEffect } from 'react'
import { LocationProvider, Router as ReachRouter, globalHistory, useLocation } from '@gatsbyjs/reach-router'
import {
  EnvironmentProvider, ActivityProvider, AppProvider, InstanceProvider,
  AnalyticsProvider, DestProvider, useEnvironment, useAnalytics, WorkspacesAPIProvider
} from './contexts'
import { Layout } from './components/layout'
import { NotFoundView } from './views'

const ContextProviders = ({ children }) => {
  return (
    <EnvironmentProvider>
      <LocationProvider>
        <DestProvider>
          <WorkspacesAPIProvider>
            <AnalyticsProvider>
              <ActivityProvider>
                <InstanceProvider>
                  {children}
                </InstanceProvider>
              </ActivityProvider>
            </AnalyticsProvider>
          </WorkspacesAPIProvider>
        </DestProvider>
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
    const unlisten = globalHistory.listen(({ location }) => {
      analyticsEvents.trackLocation(location);
    });
    return () => {
      unlisten()
    }
  }, [analyticsEvents]);

  useEffect(() => {
    return () => {
      analytics.teardown();
    }
  }, [analytics])

  useEffect(() => {
    // Track the initial location on page load (not captured in `globalHistory.listen`).
    analyticsEvents.trackLocation(location);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ReachRouter basepath={baseRouterPath} className="routing-container">
      {routes !== undefined && routes.map(({ path, text, Component, props={} }) => <Component key={path} path={path} {...props}></Component>)}
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
