import { createContext, useCallback, useContext } from 'react'
import { useNavigate } from '@gatsbyjs/reach-router'

export const DestContext = createContext({})

export const DestProvider = ({ qsKey="next", children }) => {
    const navigate = useNavigate()

    const getCurrentDest = useCallback(() => {
        const qs = new URLSearchParams(window.location.search)
        const dest = qs.get(qsKey)
        return dest
    }, [qsKey])

    // Redirect to a url and maintain the active dest reference. Don't add a dest if there is no active dest reference.
    const redirectWithCurrentDest = useCallback((redirectTo) => {
        const activeDest = getCurrentDest()
        const [toPathComponent, ...toRest] = redirectTo.split("?")
        const toQueryStringComponent = toRest.join("?")
        const qs = new URLSearchParams(toQueryStringComponent)
        if (activeDest) qs.set(qsKey, activeDest)
        const qsString = qs.toString()
        const toWithRedirect = toPathComponent + (qsString !== "" ? ("?" + qsString) : "")
        navigate(toWithRedirect)
    }, [qsKey, navigate, getCurrentDest])

    // Redirect to a url and maintain a reference to previous url in the QS to redirect back later
    const redirectWithDest = useCallback((redirectTo) => {
        // Parse the path component of the redirect url
        const [toPathComponent, ...toRest] = redirectTo.split("?")
        // Parse the query string of the redirect
        // Note that a URL may have more than one occurrence of a "?". All occurences after the first are treated as literals.
        const toQueryStringComponent = toRest.join("?")
        const qs = new URLSearchParams(toQueryStringComponent)
        // Append the destination query pararm to the redirect QS (only need to keep reference of the relative path)
        qs.set(qsKey, window.location.href.split(window.location.origin)[1])
        // Reconstruct the full redirect URL with the updated QS component
        const toWithRedirect = toPathComponent + "?" + qs.toString()
        navigate(toWithRedirect)
    }, [qsKey, navigate])

    // Redirect back to the previous url stored in the QS.
    // If defaultDest is undefined/null, no redirect will occur when next is not found in the query string.
    const redirectToDest = useCallback((defaultDest="/") => {
        const dest = getCurrentDest() || ((defaultDest !== null && defaultDest !== undefined) ? defaultDest : null)
        if (dest !== null) {
            navigate(dest)
        }
    }, [getCurrentDest])

    return (
        <DestContext.Provider value={{
            redirectWithDest,
            redirectWithCurrentDest,
            redirectToDest
        }}>
            { children }
        </DestContext.Provider>
    )
}

export const useDest = () => useContext(DestContext)