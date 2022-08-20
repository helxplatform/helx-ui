import { Button, Typography } from 'antd'
import { GithubFilled } from '@ant-design/icons'
import { SSOButton } from './sso-button'

const { Text } = Typography

export const GithubSSO = ({  }) => {
    return (
        <SSOButton
            icon={
                <GithubFilled style={{ color: "white", fontSize: 24 }} />
            }
            background="#000000"
            foreground="#ffffff"
        >
            GitHub
        </SSOButton>
    )
}