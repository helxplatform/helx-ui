import { useEffect, useMemo } from 'react'
import { Result } from 'antd'
import { useLocation } from '@reach/router'
import { useDest } from '../../../contexts'

export const LoginSuccessRedirectView = ({ }) => {
    const location = useLocation()
    const { redirectToDest } = useDest()

    const delay = useMemo(() => {
        const redirectDelay = new URLSearchParams(location.search).get("redirect_delay")
        return redirectDelay !== null ? redirectDelay : 2500
    }, [location.search])

    useEffect(() => {
        const timeout = setTimeout(() => {
            redirectToDest(null)
        }, delay)
        return () => {
            clearTimeout(timeout)
        }
    }, [location.search, delay])

    useEffect(() => {
        document.title = `Login · HeLx UI`
    }, [])

    return (
        <div>
            <Result
                status="success"
                title="Successfully Logged In"
            />
        </div>
    )
}