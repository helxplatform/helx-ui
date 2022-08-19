import { createContext, useCallback, useContext } from 'react'
import { useNavigate } from '@reach/router'

export const DestContext = createContext({})

export const DestProvider = ({ qsKey="next", children }) => {
    const navigate = useNavigate()

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
    const redirectToDest = useCallback((defaultDest="/") => {
        const qs = new URLSearchParams(window.location.search)
        const dest = qs.get(qsKey) || defaultDest
        navigate(dest)
    }, [])

    return (
        <DestContext.Provider value={{
            redirectWithDest,
            redirectToDest
        }}>
            { children }
        </DestContext.Provider>
    )
}

export const useDest = () => useContext(DestContext)