import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Modal, Space, Typography } from 'antd'
import { TimeUntil } from 'react-time-until'
import { WorkspacesAPI } from './'
import { APIError, IWorkspacesAPI, User, ExtraLink } from './api.types'
import { useEnvironment } from '../'

const { Text } = Typography

export interface IWorkspacesAPIContext {
    api: IWorkspacesAPI
    loading: boolean
    user: User | null | undefined
    loggedIn: boolean | undefined
    loginProviders: string[] | undefined
    extraLinks: ExtraLink[] | undefined
}

interface IWorkspacesAPIProvider {
    // Time until session timeout in seconds that onSessionTimeoutWarning will be emitted.
    sessionTimeoutWarningSeconds: number
    children: ReactNode
}

export const WorkspacesAPIContext = createContext<IWorkspacesAPIContext|undefined>(undefined)

export const WorkspacesAPIProvider = ({ sessionTimeoutWarningSeconds=60, children }: IWorkspacesAPIProvider) => {
    // API state
    const [user, setUser] = useState<User|null|undefined>(undefined)
    const [loginProviders, setLoginProviders] = useState<string[]|undefined>(undefined)
    const [extraLinks, setExtraLinks] = useState<ExtraLink[]|undefined>(undefined)

    // Etc.
    const [showTimeoutWarningModal, setShowTimeoutWarningModal] = useState<Date|undefined>(undefined)
    
    const { helxAppstoreUrl } = useEnvironment() as any

    const api = useMemo<IWorkspacesAPI>(() => new WorkspacesAPI({
        apiUrl: `${ helxAppstoreUrl }/api/v1/`,
        sessionTimeoutWarningSeconds
    }), [helxAppstoreUrl, sessionTimeoutWarningSeconds])

    const loggedIn = useMemo(() => user !== undefined ? !!user : undefined, [user])

    const loading = useMemo(() => (
        loggedIn === undefined ||
        loginProviders === undefined ||
        extraLinks === undefined
    ), [loggedIn, loginProviders, extraLinks])

    const onApiError = useCallback((error: APIError) => {
        console.log("--- API error encountered ---", "\n", error)
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
        console.log("Session timeout warning", timeoutDelta)
        setShowTimeoutWarningModal(
            new Date(Date.now() + timeoutDelta)
        )
    }, [])

    useEffect(() => {
        setUser(undefined)
        setLoginProviders(undefined)
        setExtraLinks(undefined)
        void async function() {
            try {
                setLoginProviders((await api.getLoginProviders()).map((provider) => provider.name))
            } catch (e) {
                // The request failed for some reason.
                setLoginProviders([])
            }
        }()
        void async function() {
            try {
                setExtraLinks((await api.getEnvironmentContext()).links)
            } catch (e) {
                // The request failed for some reason.
                setExtraLinks([])
            }
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
            loading,
            user,
            loggedIn,
            loginProviders,
            extraLinks
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
                        You will be logged out  <Text strong>
                            <TimeUntil date={ showTimeoutWarningModal } countdown={ true } finishText="in 0 seconds" />
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