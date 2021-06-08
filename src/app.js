import { LocationProvider, Router } from '@reach/router'
import { AppProvider, EnvironmentProvider, InstanceProvider } from './contexts'
import {
  ActiveView,
  AvailableView,
  SupportView,
  NotFoundView,
  SearchView,
} from './views'
import { Layout } from './components/layout'
import {SplashScreenView} from "./views/workspaces/splash-screen";

export const App = () => {
  return (
    <EnvironmentProvider>
      <LocationProvider>
        <AppProvider>
          <InstanceProvider>
            <Layout>
              <Router basepath="/helx">
                <AvailableView path="/workspaces" />
                <AvailableView path="/workspaces/available" />
                <ActiveView path="/workspaces/active" />
                <SupportView path="/support" />
                <SplashScreenView path="/workspaces/connect/:app_name/:app_url/:app_icon" />
                <SearchView path="/" />
                <SearchView path="/search" />
                <NotFoundView default />
              </Router>
            </Layout>
          </InstanceProvider>
        </AppProvider>
      </LocationProvider>
    </EnvironmentProvider >
  )
}
