import Icon from '@ant-design/icons'
import { Button } from 'antd'
import { SAMLButton } from './sso-button'
import UncPng from './old-well3-crop.png'
import { useWorkspacesAPI } from '../../../../contexts'

export const UNCSSO = (props) => {
    const { api } = useWorkspacesAPI()
    return (
        <SAMLButton
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
            login={ () => api.loginSAMLUNC() }
            { ...props }
        >
            UNC
        </SAMLButton>
    )
}