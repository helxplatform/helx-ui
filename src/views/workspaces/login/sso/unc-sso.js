import Icon from '@ant-design/icons'
import { Button } from 'antd'
import { SSOButton } from './sso-button'
import UncPng from './old-well3-crop.png'
import { useWorkspacesAPI } from '../../../../contexts'

export const UNCSSO = ({  }) => {
    const { api } = useWorkspacesAPI()
    return (
        <SSOButton
            icon={
                <Icon component={ () => (
                    <img
                        // width={ 24 }
                        height={ 24 }
                        src={ UncPng }
                    />
                ) } />
            }
            background="#57a0d3"
            iconBackground="#57a0d3"
            foreground="#ffffff"
            onClick={ async () => {
                try {
                    await api.loginSAMLUNC()
                    console.log("Successfully logged in")
                } catch (e) {
                    console.log("Failed to log in", e)
                }
            } }
        >
            UNC
        </SSOButton>
    )
}