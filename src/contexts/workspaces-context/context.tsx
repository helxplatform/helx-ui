import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Modal, Space, Typography } from 'antd'
import { TimeUntil } from 'react-time-until'
import { WorkspacesAPI } from './'
import { APIError, IWorkspacesAPI, Provider, User } from './api.types'
import { useEnvironment } from '../'

const { Text } = Typography

export interface IWorkspacesAPIContext {
    api: IWorkspacesAPI,
    user: User | null | undefined,
    loggedIn: boolean | undefined,
    loginProviders: string[] | undefined
}

interface IWorkspacesAPIProvider {
    // Time until session timeout in seconds that onSessionTimeoutWarning will be emitted.
    sessionTimeoutWarningSeconds: number,
    children: ReactNode
}

export const WorkspacesAPIContext = createContext<IWorkspacesAPIContext|undefined>(undefined)

export const WorkspacesAPIProvider = ({ sessionTimeoutWarningSeconds=60, children }: IWorkspacesAPIProvider) => {
    // API state
    const [user, setUser] = useState<User|null|undefined>(undefined)
    const [loginProviders, setLoginProviders] = useState<string[]|undefined>(undefined)

    // Etc.
    const [showTimeoutWarningModal, setShowTimeoutWarningModal] = useState<number|undefined>(undefined)
    
    const { helxAppstoreUrl } = useEnvironment() as any

    const api = useMemo<IWorkspacesAPI>(() => new WorkspacesAPI({
        apiUrl: `${ helxAppstoreUrl }/api/v1/`,
        sessionTimeoutWarningSeconds
    }), [helxAppstoreUrl, sessionTimeoutWarningSeconds])

    const loggedIn = useMemo(() => user !== undefined ? !!user : undefined, [user])

    const onApiError = useCallback((error: APIError) => {
        console.error("API error encountered", error)
    }, [])
    const onLoginStateChanged = useCallback((user: User | null, sessionTimeout: boolean) => {
        console.log("User changed", user)
        if (user === null) {
            console.log("Session timeout", sessionTimeout)
            setShowTimeoutWarningModal(undefined)
        }
        setUser(user)
    }, [])
    const onSessionTimeoutWarning = useCallback((timeoutDelta: number) => {
        console.log("Session timeout warning")
        setShowTimeoutWarningModal(
            timeoutDelta
        )
    }, [])

    useEffect(() => {
        setUser(undefined)
        setLoginProviders(undefined)
        void async function() {
            setLoginProviders((await api.getLoginProviders()).map((provider) => provider.name))
        }()
    }, [api])

    useEffect(() => {
        api.onApiError = onApiError
        api.onLoginStateChanged = onLoginStateChanged
        api.onSessionTimeoutWarning = onSessionTimeoutWarning
    }, [api, onApiError, onLoginStateChanged])

    const stayLoggedIn = useCallback(() => {
        try {
            // Ping the API to refresh the session
            api.getActiveUser()
            setShowTimeoutWarningModal(undefined)
        } catch (e) {
            // Failed to ping API
        }
    }, [api])

    return (
        <WorkspacesAPIContext.Provider value={{
            api,
            user,
            loggedIn,
            loginProviders
        }}>
            { children }
            <Modal
                title="Inactivity Logout Warning"
                visible={ !!showTimeoutWarningModal }
                onOk={ stayLoggedIn }
                onCancel={ stayLoggedIn }
                cancelButtonProps={{
                    onClick: () =>  {
                        api.logout()
                        setShowTimeoutWarningModal(undefined)
                        
                    }
                }}
                okText="Stay logged in"
                cancelText="Log out"
            >
                <Space direction="vertical">
                    <Text style={{ fontSize: 18 }}>
                        You will be logged out in <Text strong>
                            <TimeUntil delta={ showTimeoutWarningModal } />
                            {/* {timeoutMinutes > 1 ? `${ timeoutMinutes } minutes` : timeoutMinutes === 1 ? `1 minute` : ``} */}
                        </Text>
                    </Text>
                    <Text style={{ fontSize: 13 }}>
                        You are about to be timed-out due to inactivity. For security reasons, sessions expire automatically
                        after { Math.floor((user?.sessionTimeout || 0) / 60) } minutes unless you come back.
                    </Text>
                    {/* <Text style={{ fontSize: 13 }}>
                        Please choose whether or not to stay logged in.
                    </Text> */}
                </Space>
            </Modal>
        </WorkspacesAPIContext.Provider>
    )
}

export const useWorkspacesAPI = () => useContext(WorkspacesAPIContext)