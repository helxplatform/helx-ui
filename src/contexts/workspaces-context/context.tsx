import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Modal, Space, Typography } from 'antd'
import { TimeUntil } from 'react-time-until'
import { backOff } from 'exponential-backoff'
import { WorkspacesAPI } from './'
import { IWebsocketAPI, WebsocketAPI } from './ws'
import { APIError, IWorkspacesAPI, User, ExtraLink, EnvironmentContext } from './api.types'
import { useEnvironment } from '../'
import { usePageActivity } from '../../hooks'

const { Text } = Typography

const STARTING_DELAY = 10 * 1000 // the coefficient, e.g. the initial delay.
const TIME_MULTIPLE = 2 // the base, e.g. wait twice as long every backoff.
// I.e. f(n) = STARTING_DELAY * Math.pow(TIME_MULTIPLE, n) where n is the current attempt count and f(n) is the backoff in ms.

const WEBSOCKET_REOPEN_DELAY = 5 * 1000

export interface IWorkspacesAPIContext {
    api: IWorkspacesAPI
    wsApi: IWebsocketAPI | null
    loading: boolean
    user: User | null | undefined
    loggedIn: boolean | undefined
    loginProviders: string[] | undefined
    appstoreContext: EnvironmentContext | undefined
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
    const [environmentContext, setEnvironmentContext] = useState<EnvironmentContext|undefined>(undefined)

    // Etc.
    const [showTimeoutWarning, setShowTimeoutWarning] = useState<number|null>(null)
    const [loadingBackoff, setLoadingBackoff] = useState<Date|undefined>(undefined)
    const [wsReconnect, setWsReconnect] = useState<number>(0)

    const { helxAppstoreUrl, helxWebsocketUrl } = useEnvironment() as any

    const warningIntervalIdRef = useRef<number>()
    const logoutIntervalIdRef = useRef<number>()

    const backoffOptions = useMemo(() => ({
        startingDelay: STARTING_DELAY,
        timeMultiple: TIME_MULTIPLE,
        numOfAttempts: Infinity,
        retry: async (e: any, attemptNumber: number) => {
            const nextDelay = STARTING_DELAY * Math.pow(TIME_MULTIPLE, attemptNumber - 1)
            setLoadingBackoff(new Date(Date.now() + nextDelay))
            return true
        }
    }), [])

    const api = useMemo<IWorkspacesAPI>(() => new WorkspacesAPI({
        apiUrl: `${ helxAppstoreUrl }/api/v1/`
    }), [helxAppstoreUrl])

    const [wsApi, setWsApi] = useState<IWebsocketAPI|null>(null)
    // const wsApi = useMemo<IWebsocketAPI|null>(() => user ? new WebsocketAPI({
    //     wsUrl: helxWebsocketUrl
    // }) : null, [helxWebsocketUrl, user, wsReconnect])

    const loggedIn = useMemo(() => user !== undefined ? !!user : undefined, [user])

    const loading = useMemo(() => (
        loggedIn === undefined ||
        loginProviders === undefined ||
        environmentContext === undefined
    ), [loggedIn, loginProviders, environmentContext])

    const stayLoggedIn = useCallback(async () => {
        // Hide the logout warning, if it's visible
        setShowTimeoutWarning(null)
        try {
            // Ping the API to refresh the session
            await api.getActiveUser()
        } catch (e) {}
    }, [api])

    const logoutAndHideWarning = useCallback(async () => {
        // Note: technically, logging the user out will trigger a user state changed event,
        // which will then hide the warning automatically if the user is successfully logged out.
        // However, we are also hiding it here manually since `api.logout` has latency due to being an API
        // request so it's smoother to immediately hide the warning.
        setShowTimeoutWarning(null)
        try {
            await api.logout()
        } catch (e) {}
    }, [api])

    const onApiError = useCallback((error: APIError) => {
        if (error.status === 401 || error.status === 403) {
            // If the user encounters a 401 or 403, this means their session is no longer valid.
            // They shouldn't be able to in the first place, since the session timer should log them out automatically,
            // but this is here just in case.
            setUser(null)
        } else {
            console.log("--- API error encountered ---", "\n", error)
        }
    }, [])
    
    const onApiRequest = useCallback((methodName: string, promise: Promise<any>) => {
        // console.log(`api request ${ methodName } executed`)
        
        // Clear current timers
        clearInterval(warningIntervalIdRef.current)
        clearInterval(logoutIntervalIdRef.current)
        if (user) {
            /**
             * Note: using intervals, rather than timeouts, to avoid bugs related to process suspension.
             * Sleeping a computer will most likely suspend the user's browser process which suspends the timeout.
             * Since timeouts work on a relative delta, when the timeout is suspended, it will no longer execute at the
             * originally intended timestamp.
             */
            const intervalDelayMs = 50

            // Time the user out a second earlier than the actual timeout for good measure.
            const timeoutDeltaMs = (user.sessionTimeout - 1) * 1000
            // Timestamp analog of the delta.
            const timeoutTimestamp = new Date(Date.now() + timeoutDeltaMs).getTime()
            // Delta to display the warning that the user will be logged out soon.
            const timeoutWarningDeltaMs = Math.max(0, timeoutDeltaMs - (sessionTimeoutWarningSeconds * 1000))
            // Timestamp analog of the warning delta.
            const timeoutWarningTimestamp = new Date(Date.now() + timeoutWarningDeltaMs).getTime()
            
            // Set timeout to display logout warning to user
            warningIntervalIdRef.current = window.setInterval(() => {
                if (timeoutWarningTimestamp <= Date.now()) {
                    clearInterval(warningIntervalIdRef.current)
                    setShowTimeoutWarning(timeoutTimestamp)
                }
            }, intervalDelayMs)

            // Set timeout to log the user out
            logoutIntervalIdRef.current = window.setInterval(async () => {
                if (timeoutTimestamp <= Date.now()) {
                    clearInterval(logoutIntervalIdRef.current)
                    logoutAndHideWarning()
                }
            }, intervalDelayMs)
        }
    }, [user, stayLoggedIn, logoutAndHideWarning])

    const onLoginStateChanged = useCallback((user: User | null) => {
        if (user === null) {
            setShowTimeoutWarning(null)
            clearInterval(warningIntervalIdRef.current)
            clearInterval(logoutIntervalIdRef.current)
        }
        setUser(user)
    }, [])

    useEffect(() => {
        setUser(undefined)
        setLoginProviders(undefined)
        setEnvironmentContext(undefined)
        void async function() {
            try {
                const [
                    user,
                    loginProviders,
                    environmentContext
                ] = await backOff<[
                    User | null,
                    string[],
                    EnvironmentContext
                ]>(
                    async () => {
                        let user: User | null
                        try {
                            user = await api.getActiveUser()
                        } catch (e: any) {
                            // This could be a 403 (not signed in) or a WhitelistRequiredError, treat it as signed out regardless.
                            user = null
                        }
                        const loginProviders = (await api.getLoginProviders()).map((provider) => provider.name)
                        const environmentContext = await api.getEnvironmentContext()
                        return [user, loginProviders, environmentContext]
                    },
                    backoffOptions
                )
                setUser(user)
                setLoginProviders(loginProviders)
                setEnvironmentContext(environmentContext)
            } catch (e: any) {
                // Maximum backoff attempts reached. 
                console.log("Could not load initial app state in a reasonable amount of time.")
            }
        }()
    }, [api])

    useEffect(() => {
        const unsubscribeOnApiError = api.on("apiError", onApiError)
        // The API itself no longer manages session timeouts, so we know for certain the change in login state is not triggered by a session timeout here.
        const unsubscribeUserStateChanged = api.on("userStateChanged", (user) => onLoginStateChanged(user))
        const unsubscribeOnApiRequest = api.on("apiRequest", onApiRequest)
        return () => {
            unsubscribeOnApiError()
            unsubscribeUserStateChanged()
            unsubscribeOnApiRequest()
        }
    }, [api, onApiError, onLoginStateChanged, onApiRequest])

    /*useEffect(() => {
        let timeout: number
        const triggerReconnect = () => {
            console.error(`WebSocket connection was closed prematurely, attempting to reestablish in ${ WEBSOCKET_REOPEN_DELAY / 1E3 }s...`)
            timeout = window.setTimeout(() => setWsReconnect(wsReconnect + 1), WEBSOCKET_REOPEN_DELAY)
        }
        if (wsApi) {
            wsApi.getWebsocket().addEventListener("close", triggerReconnect)
        }
        return () => {
            window.clearTimeout(timeout)
            wsApi?.getWebsocket().removeEventListener("close", triggerReconnect)
            // Make sure to close old websocket connections when the memo hook creates new ones.
            wsApi?.close()
        }
    }, [wsApi])*/

    useEffect(() => {
        if (!user) {
            setWsApi(null)
            return
        }
        const createWs = () => new WebsocketAPI({
            wsUrl: helxWebsocketUrl
        })
        const _wsApi = createWs()
        let timeout: number
        const setWs = () => setWsApi(_wsApi)
        const triggerReconnect = () => {
            console.error(`WebSocket connection was closed prematurely, attempting to reestablish in ${ WEBSOCKET_REOPEN_DELAY / 1E3 }s...`)
            timeout = window.setTimeout(() => {
                setWsReconnect(wsReconnect + 1)
            }, WEBSOCKET_REOPEN_DELAY)
        }
        _wsApi.getWebsocket().addEventListener("message", (e) => {
            // The websocket server presents the connection in the open state while still verifying the user's identity.
            // Therefore, clients should wait until receiving a _confirmReady event before sending messages.
            const { type } = JSON.parse(e.data)
            if (type === "_confirmReady") setWs()
        })
        _wsApi.getWebsocket().addEventListener("close", triggerReconnect)

        return () => {
            // Data has updated, these will now cause stale state if they run, so need to get cleared/removed.
            clearTimeout(timeout)
            _wsApi.getWebsocket().removeEventListener("message", setWs)
            _wsApi.getWebsocket().removeEventListener("close", triggerReconnect)
            _wsApi.close()
        }
    }, [helxWebsocketUrl, user, wsReconnect])

    return (
        <WorkspacesAPIContext.Provider value={{
            api,
            wsApi,
            loading,
            user,
            loggedIn,
            loginProviders,
            appstoreContext: environmentContext,
            loadingBackoff
        }}>
            { children }
            <Modal
                title="Inactivity Logout Warning"
                visible={ showTimeoutWarning !== null }
                onOk={ () => {
                    stayLoggedIn()
                } }
                onCancel={ () => {
                    stayLoggedIn()
                } }
                cancelButtonProps={{
                    onClick: logoutAndHideWarning
                }}
                okText="Stay logged in"
                cancelText="Log out"
            >
                <Space direction="vertical">
                    <Text style={{ fontSize: 18 }}>
                        You will be logged out <Text strong>
                            <TimeUntil date={ new Date(showTimeoutWarning!) } countdown={ true } finishText="in 0 seconds" />
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