import { useMemo } from 'react'
import { useWorkspacesAPI } from '../../../../contexts'
import { SAMLButton } from './sso-button'
import KeycloakPng from './keycloak-glyph-color.png'
import Icon from '@ant-design/icons'


/*
    Component to render the button and handling of the Dex OAuth
 */
export const KeycloakOAuth = (props) => {
    // get the context for the workspaces
    const { api } = useWorkspacesAPI()

    // create some state for the icon
    const icon = useMemo(() => (
        <Icon component={ () => (
            <img
                width={ 122 }
                height={ 24 }
                src={ KeycloakPng }
            />
        ) } />
    ), [])

    // return the button control for rendering
    return (
        <SAMLButton
            icon={ icon }
            background="#ffffff"
            iconBackground="#000000"
            foreground="#000000"
            login={ () => api.loginKeycloak() }
            { ...props }
        >
        </SAMLButton>
    )
}