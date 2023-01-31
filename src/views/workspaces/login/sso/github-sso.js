import { Button, Typography } from 'antd'
import { GithubFilled } from '@ant-design/icons'
import { SAMLButton } from './sso-button'
import { useWorkspacesAPI } from '../../../../contexts'

const { Text } = Typography

export const GithubSSO = (props) => {
    const { api } = useWorkspacesAPI()
    return (
        <SAMLButton
            icon={
                <GithubFilled style={{ color: "white", fontSize: 24 }} />
            }
            background="#000000"
            foreground="#ffffff"
            login={ () => api.loginSAMLGithub() }
            { ...props }
        >
            GitHub
        </SAMLButton>
    )
}