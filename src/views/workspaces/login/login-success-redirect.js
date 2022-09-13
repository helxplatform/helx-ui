import { useEffect } from 'react'
import { Result } from 'antd'

export const LoginSuccessRedirectView = ({ }) => {
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