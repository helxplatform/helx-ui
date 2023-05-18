import { useCallback, useEffect, useState } from 'react'
import { useThrottledCallback } from 'use-debounce'

interface PageActivityProps {
    // The amount in MS to throttle updates to the return value by
    throttleMs?: number
    // When true, it will disable updates to the internal activity value.
    // This is really just intended for use in the Workspaces context, since
    // this hook was built specifically for that context.
    disableUpdates?: boolean
    // Only tracks activity updates occuring in this element's DOM tree
    root?: HTMLElement
}

export const usePageActivity = ({
    throttleMs=0,
    disableUpdates=false,
    root=document.body
}: PageActivityProps) => {
    const [lastActivity, _setLastActivity] = useState<number>(Date.now())

    const setLastActivity = useThrottledCallback(_setLastActivity, throttleMs)

    const updateLastActivity = useCallback(() => setLastActivity(Date.now()), [setLastActivity])

    const callback = useCallback((e: MouseEvent) => {
        if (!disableUpdates) updateLastActivity()
    }, [disableUpdates, updateLastActivity])
    
    useEffect(() => {
        root.addEventListener("mousemove", callback)
        return () => {
            root.removeEventListener("mousemove", callback)
        }
    }, [callback])

    return [lastActivity, updateLastActivity] as const
}