import { Fragment } from 'react'
import { Spin } from 'antd'
import { LocationProvider, Router } from '@reach/router'
import { useEnvironment } from './contexts'
import { ActivityProvider, AppProvider, InstanceProvider } from './contexts'
import {
    ActiveView,
    AvailableView,
    LoadingView,
    SupportView,
    NotFoundView,
    SearchView,
} from './views'
import { Layout } from './components/layout'

const renderSearchModule = (searchEnabled) => {
    if (searchEnabled === 'true') {
        return <SearchView path="/search" />
    }
}

const renderWorkspacesModule = (workspacesEnabled) => {
    if (workspacesEnabled === 'true') {
        return <Fragment>
            <AvailableView path="/workspaces" />
            <AvailableView path="/workspaces/available" />
            <ActiveView path="/workspaces/active" />
        </Fragment>
    }
}

const routeHomepage = (searchEnabled, workspacesEnabled) => {
    if (searchEnabled === 'false') {
        if (workspacesEnabled === 'true') {
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

export const AppWrapper = () => {
    const { searchEnabled, workspacesEnabled } = useEnvironment();

    return (
        <LocationProvider>
            <ActivityProvider>
                <AppProvider>
                    <InstanceProvider>
                        <Layout>
                            <Router basepath="/helx">
                                <SupportView path="/support" />
                                {searchEnabled === 'false' && workspacesEnabled === 'false' && (<LoadingView  path="/" />)}
                                {renderSearchModule(searchEnabled)}
                                {renderWorkspacesModule(workspacesEnabled)}
                                {routeHomepage(searchEnabled, workspacesEnabled)}
                                <NotFoundView default />
                            </Router>
                        </Layout>
                    </InstanceProvider>
                </AppProvider>
            </ActivityProvider>
        </LocationProvider>
    )
}
