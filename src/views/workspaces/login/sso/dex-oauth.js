import { useMemo } from 'react'
import { useWorkspacesAPI } from '../../../../contexts'
import { SAMLButton } from './sso-button'
import DexPng from './dex-glyph-color.png'
import Icon from '@ant-design/icons'


/*
    Component to render the button and handling of the Dex OAuth
 */
export const DexOAuth = (props) => {
    // get the context for the workspaces
    const { api } = useWorkspacesAPI()

    // create some state for the icon
    const icon = useMemo(() => (
        <Icon component={ () => (
            <img
                width={ 24 }
                height={ 24 }
                src={ DexPng }
            />
        ) } />
    ), [])

    // return the button control for rendering
    return (
        <SAMLButton
            icon={ icon }
            background="#ed4b5b"
            iconBackground="#ffffff"
            foreground="#ffffff"
            login={ () => api.loginDex() }
            { ...props }
        >Dex
        </SAMLButton>
    )
}