import { useEffect, useMemo } from 'react'
import { Result } from 'antd'
import { useLocation } from '@gatsbyjs/reach-router'
import { useDest, useEnvironment } from '../../../contexts'

export const LoginSuccessRedirectView = ({ }) => {
    const location = useLocation()
    const { basePath } = useEnvironment()
    const { redirectToDest } = useDest()

    const delay = useMemo(() => {
        const redirectDelay = new URLSearchParams(location.search).get("redirect_delay")
        console.log(redirectDelay !== null ? redirectDelay : 2500)
        return redirectDelay !== null ? redirectDelay : 2500
    }, [location.search])

    useEffect(() => {
        const timeout = setTimeout(() => {
            redirectToDest(basePath)
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
                subTitle="Redirecting..."
            />
        </div>
    )
}