import { Button, Typography } from 'antd'
import Icon, { GoogleCircleFilled, GithubFilled } from '@ant-design/icons'
import { SAMLButton } from './sso-button'
import GooglePng from './g-logo.png'
import { useWorkspacesAPI } from '../../../../contexts'

const { Text } = Typography

export const GoogleSSO = (props) => {
    const { api } = useWorkspacesAPI()
    return (
        <SAMLButton
            icon={
                <Icon component={ () => (
                    <img
                        width={ 24 }
                        height={ 24 }
                        src={ GooglePng }
                    />
                ) } />
            }
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