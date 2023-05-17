import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Modal, Space, Typography } from 'antd'
import { TimeUntil } from 'react-time-until'
import { backOff } from 'exponential-backoff'
import { WorkspacesAPI } from './'
import { APIError, IWorkspacesAPI, User, ExtraLink } from './api.types'
import { useEnvironment } from '../'

const { Text } = Typography

const STARTING_DELAY = 10 * 1000 // the coefficient, e.g. the initial delay.
const TIME_MULTIPLE = 2 // the base, e.g. wait twice as long every backoff.
// I.e. f(n) = STARTING_DELAY * Math.pow(TIME_MULTIPLE, n) where n is the current attempt count and f(n) is the backoff in ms.

export interface IWorkspacesAPIContext {
    api: IWorkspacesAPI
    loading: boolean
    user: User | null | undefined
    userCanViewAdmin: boolean | undefined
    loggedIn: boolean | undefined
    loginProviders: string[] | undefined
    extraLinks: ExtraLink[] | undefined
    loadingBackoff: Date | undefined
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
    const [loadingBackoff, setLoadingBackoff] = useState<Date|undefined>(undefined)

    const { helxAppstoreUrl } = useEnvironment() as any

    const backoffOptions = {
        startingDelay: STARTING_DELAY,
        timeMultiple: TIME_MULTIPLE,
        numOfAttempts: Infinity,
        retry: async (e: any, attemptNumber: number) => {
            const nextDelay = STARTING_DELAY * Math.pow(TIME_MULTIPLE, attemptNumber - 1)
            setLoadingBackoff(new Date(Date.now() + nextDelay))
            return true
        }
    }

    const api = useMemo<IWorkspacesAPI>(() => new WorkspacesAPI({
        apiUrl: `${ helxAppstoreUrl }/api/v1/`,
        sessionTimeoutWarningSeconds
    }), [helxAppstoreUrl, sessionTimeoutWarningSeconds])

    const loggedIn = useMemo(() => user !== undefined ? !!user : undefined, [user])
    const userCanViewAdmin = useMemo(() => user?.staff || user?.superuser, [user])

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
            // console.log("Session timeout", sessionTimeout)
            setShowTimeoutWarningModal(undefined)
        }
        setUser(user)
    }, [])
    const onSessionTimeoutWarning = useCallback((timeoutDelta: number) => {
        // console.log("Session timeout warning", timeoutDelta)
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
                const [
                    loginProviders,
                    extraLinks
                ] = await backOff<[
                    string[],
                    ExtraLink[]
                ]>(
                    async () => {
                        // setLoadingBackoff(undefined)
                        await api.updateLoginState()
                        if (api.user === undefined) {
                            // The user is still loading, meaning the request has failed to load the login state.
                            throw Error()
                        }
                        const loginProviders = (await api.getLoginProviders()).map((provider) => provider.name)
                        const extraLinks = (await api.getEnvironmentContext()).links
                        return [loginProviders, extraLinks]
                    },
                    backoffOptions
                )
                setLoginProviders(loginProviders)
                setExtraLinks(extraLinks)
            } catch (e: any) {
                // Maximum backoff attempts reached. 
            }
        }()
        // void async function() {
        //     try {
        //         setLoginProviders((await api.getLoginProviders()).map((provider) => provider.name))
        //     } catch (e) {
        //         // The request failed for some reason.
        //         setLoginProviders([])
        //     }
        // }()
        // void async function() {
        //     try {
        //         setExtraLinks((await api.getEnvironmentContext()).links)
        //     } catch (e) {
        //         // The request failed for some reason.
        //         setExtraLinks([])
        //     }
        // }()
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
            userCanViewAdmin,
            loggedIn,
            loginProviders,
            extraLinks,
            loadingBackoff
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