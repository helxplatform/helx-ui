import { useEffect, useState } from 'react'
import { useDebounce, useThrottledCallback } from 'use-debounce'

export const usePageActivity = (throttle: number=0, root: HTMLElement=document.body) => {
    const [lastActivity, _setLastActivity] = useState<number>(Date.now())

    const setLastActivity = useThrottledCallback(_setLastActivity, throttle)

    useEffect(() => {
        const callback = (e: MouseEvent) => {
            setLastActivity(Date.now())
        }
        root.addEventListener("mousemove", callback)
        return () => {
            root.removeEventListener("mousemove", callback)
        }
    }, [])

    return lastActivity
}