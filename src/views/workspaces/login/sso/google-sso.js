import { Button, Typography } from 'antd'
import Icon, { GoogleCircleFilled, GithubFilled } from '@ant-design/icons'
import { SSOButton } from './sso-button'
import GooglePng from './g-logo.png'
import { useWorkspacesAPI } from '../../../../contexts'

const { Text } = Typography

export const GoogleSSO = ({  }) => {
    const { api } = useWorkspacesAPI()
    return (
        <SSOButton
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
            onClick={ async () => {
                try {
                    await api.loginSAMLGoogle()
                    console.log("Successfully logged in")
                } catch (e) {
                    console.log("Failed to log in", e)
                }
            } }
        >
            Google
        </SSOButton>
    )
} 