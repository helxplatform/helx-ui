import { useMemo } from 'react'
import { Button, Typography } from 'antd'
import Icon, { GoogleCircleFilled, GithubFilled } from '@ant-design/icons'
import { SAMLButton } from './sso-button'
import GooglePng from './g-logo.png'
import { useWorkspacesAPI } from '../../../../contexts'

const { Text } = Typography

export const GoogleSSO = (props) => {
    const { api } = useWorkspacesAPI()

    /** There's a bug with the Icon component where it will rerender its component prop (thus reloading the src) every rerender */
    const icon = useMemo(() => (
        <Icon component={ () => (
            <img
                width={ 24 }
                height={ 24 }
                src={ GooglePng }
            />
        ) } />
    ), [])
    return (
        <SAMLButton
            icon={ icon }
            background="#4285f4"
            iconBackground="#ffffff"
            foreground="#ffffff"
            login={ () => api.loginSAMLGoogle() }
            { ...props }
        >
            Google
        </SAMLButton>
    )
} 