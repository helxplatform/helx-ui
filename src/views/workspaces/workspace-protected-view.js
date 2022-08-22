import { Space, Spin, Typography } from 'antd'
import React, { useMemo } from 'react'
import { useEnvironment, useWorkspacesAPI } from '../../contexts'
import { ProtectedView, withAuthentication } from '../protected-view'

const { Text } = Typography

export const APILoadingProtectedView = ({ children }) => {
    const { loggedIn, loginProviders } = useWorkspacesAPI()

    const apiLoading = useMemo(() => (
        loggedIn === undefined ||
        loginProviders === undefined
    ), [loggedIn, loginProviders])
    
    if (apiLoading) return (
        <Space direction="vertical" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", flex: 1 }}>
            <Spin />
            {/* <Text>Workspaces loading...</Text> */}
        </Space>
    )
    return (
        children
    )
}

export const WorkspaceProtectedView = ({ props, children }) => {
    const { basePath } = useEnvironment()
    const { loggedIn } = useWorkspacesAPI()

    return (
        <APILoadingProtectedView>
            <ProtectedView authorized={ loggedIn } redirect={ `${ basePath }workspaces/login` } { ...props }>
                { children }
            </ProtectedView>
        </APILoadingProtectedView>
    )
}

/** HOC */
export const withWorkspaceAuthentication = (WorkspaceView, authProps) => {
    return (props) => (
        <WorkspaceProtectedView { ...authProps }>
            <WorkspaceView { ...props } />
        </WorkspaceProtectedView>
    )
}

/** HOC */
/** Specifically for use in login view, where we need to wait for login providers to load. */
export const withAPIReady = (View, props) => {
    return (props) => (
        <APILoadingProtectedView>
            <View { ...props } />
        </APILoadingProtectedView>
    )
}