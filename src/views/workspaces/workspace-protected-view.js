import React, { Fragment, useMemo } from 'react'
import { Button, Space, Spin, Typography } from 'antd'
import { TimeUntil, useTimeUntil } from 'react-time-until'
import { useEnvironment, useWorkspacesAPI } from '../../contexts'
import { ProtectedView, withAuthentication } from '../protected-view'

const { Text } = Typography

export const APILoadingProtectedView = ({ children }) => {
    const { loading: apiLoading, loadingBackoff } = useWorkspacesAPI()
    const loadingBackoffDate = useMemo(() => new Date(Date.now() + loadingBackoff), [loadingBackoff])
    const timeUntil = useTimeUntil({ date: loadingBackoffDate, countdown: true })
    
    if (apiLoading) return (
        <Space direction="vertical" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", flex: 1 }}>
            <Spin />
            { loadingBackoff !== undefined && (
                <Text type="secondary">
                    Failed to load - retrying&nbsp;
                    {/* Make sure the time until text never goes to 0 to avoid text blinking. */}
                    <TimeUntil value={{ ...timeUntil, seconds: Math.max(timeUntil.seconds, 1) }} countdown />
                </Text>
            ) }
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
export const withAPIReady = (View) => {
    return (props) => (
        <APILoadingProtectedView>
            <View { ...props } />
        </APILoadingProtectedView>
    )
}