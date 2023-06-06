import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { backOff } from 'exponential-backoff'
import { useWorkspacesAPI } from './'
import { AvailableApp, AvailableAppsResponse } from './workspaces-context/api.types'
import { AppStatusEvent } from './workspaces-context/websocket-events'

const BACKOFF_OPTIONS = {
    startingDelay: 1,
    timeMultiple: 2,
    numOfAttempts: Infinity
}

interface IActivityContext {
    appSpecs: AvailableAppsResponse | null
    appActivityCache: AppStatusEvent[] | null
    getLatestActivity: (systemId: string) => AppStatusEvent | undefined
    clearActivity: () => void
}

export const ActivityContext = createContext<IActivityContext>({} as IActivityContext);

// This activity context provider is used to store and keep track of all latest workspace activities,
// including launch app, update/delete instances, polling service.
// Latest activity of each instance will be shown in the side panel component. 

export const ActivityProvider = ({ children }: { children: any }) => {
    const [activityArray, setActivityArray] = useState<any>([]);
    const { api, wsApi, loggedIn } = useWorkspacesAPI()!
    
    const [appSpecs, setAppSpecs] = useState<AvailableAppsResponse | null>(null)
    const [appActivityCache, setAppActivityCache] = useState<AppStatusEvent[]>([])
    
    const clearActivity = useCallback(() => {
        setAppActivityCache([])
    }, [])

    const addActivity = useCallback((newActivity: any) => {
        setActivityArray((oldActivityArray: any) => (
            [ newActivity, ...oldActivityArray ]
        ))
    }, [])

    const updateActivity = useCallback((newActivity: any) => {
        setActivityArray((oldActivityArray: any) => (
            [
                newActivity,
                ...oldActivityArray.filter((value: any) => value['sid'] !== newActivity['sid'])
            ]
        ))
    }, [])

    const getLatestActivity = useCallback((systemId: string) => {
        return appActivityCache.find((event) => event.data.systemId === systemId)
    }, [appActivityCache])

    useEffect(() => {
        setAppSpecs(null)

        if (!loggedIn) return

        let cancelled = false
        void async function() {
            const appSpecs = await backOff<AvailableAppsResponse>(
                async () => {
                    return await api.getAvailableApps()
                },
                {
                    ...BACKOFF_OPTIONS,
                    retry: (e: any, attemptNumber: number) => {
                        console.error("Failed to load available app specs, retrying...")
                        if (cancelled) {
                            console.log("API or login state has changed, cancelling app spec retry...")
                            // Stop retrying.
                            return false
                        }
                        // Continue retrying...
                        return true
                    }
                }
            )
            setAppSpecs(appSpecs)
        }()
        return () => {
            cancelled = true
        }
    }, [api, loggedIn])

    useEffect(() => {
        setAppActivityCache([])
        
        if (!wsApi || !appSpecs) return

        const addEventsToCache = (events: AppStatusEvent[]) => (
            setAppActivityCache((oldCache) => {
                const newUids = events.map((event) => event.uid)
                return [
                    // Make sure we remove any duplicate events.
                    ...oldCache.filter((event) => !newUids.includes(event.uid)),
                    ...events
                ].sort((a, b) => b.timestamp - a.timestamp)
            })
        )

        const unsub = wsApi.on("initialAppStatuses", (appStatuses) => {
            addEventsToCache(appStatuses.data)
            unsub()
        })
        wsApi.on("appStatus", (appStatus) => {
            addEventsToCache([ appStatus ])
        })
        wsApi.requestInitialAppStatuses()
    }, [wsApi, appSpecs])

    return (
        <ActivityContext.Provider
            value={{
                appSpecs,
                appActivityCache,
                getLatestActivity,
                clearActivity,
                activity: activityArray,
                addActivity: addActivity,
                updateActivity: updateActivity
            } as any}>
            {children}
        </ActivityContext.Provider>
    )
}

export const useActivity = () => useContext(ActivityContext);