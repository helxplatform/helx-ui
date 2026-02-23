import { useMemo } from 'react'
import { useWorkspacesAPI } from '../../../../contexts'
import { SAMLButton } from './sso-button'
import CILogonPng from './cilogon.png'
import Icon from '@ant-design/icons'


/*
    Component to render the button and handling of the CILogon OAuth
 */
export const CILogonSSO = (props) => {
    // get the context for the workspaces
    const { api } = useWorkspacesAPI()

    // create some state for the icon
    const icon = useMemo(() => (
        <Icon component={ () => (
            <img
                // width={ 24 }
                height={ 24 }
                src={ CILogonPng }
            />
        ) } />
    ), [])

    // return the button control for rendering
    return (
        <SAMLButton
            icon={ icon }
            background="#C5F1C7"
            iconBackground="#C5F1C7"
            foreground="#ffffff"
            login={ () => api.loginSAMLCILogon() }
            { ...props }
        >
        </SAMLButton>
    )
}