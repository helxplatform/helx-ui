import { Button, Typography } from 'antd'
import Icon, { GoogleCircleFilled, GithubFilled } from '@ant-design/icons'
import { SSOButton } from './sso-button'
import GooglePng from './g-logo.png'

const { Text } = Typography

export const GoogleSSO = ({  }) => {
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
        >
            Google
        </SSOButton>
    )
} 