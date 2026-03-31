import { useMemo } from 'react'
import Icon from '@ant-design/icons'
import { Button } from 'antd'
import { SAMLButton } from './sso-button'
import UncPng from './old-well-black.png'
import { useEnvironment, useWorkspacesAPI } from '../../../../contexts'

export const UNCSSO = (props) => {
    const { context } = useEnvironment()
    const { api } = useWorkspacesAPI()

    const theme = useMemo(() => (
        context.brand === 'ai_sandbox' ? {
            foreground: '#fff',
            background: '#06667d'
        } : {
            foreground: '#fff',
            background: '#57a0d3'
        }
    ), [context])

    /** There's a bug with the Icon component where it will rerender its component prop (thus reloading the src) every rerender */
    const icon = useMemo(() => (
        <Icon component={ () => (
            <img
                // width={ 24 }
                height={ 20 }
                style={{ filter: 'invert(1)', mixBlendMode: 'screen' }}
                src={ UncPng }
            />
        ) } />
    ), [])
    return (
        <SAMLButton
            icon={ icon }
            background={theme.background}
            iconBackground={theme.background}
            foreground={theme.foreground}
            login={ () => api.loginSAMLUNC() }
            { ...props }
        >
            UNC
        </SAMLButton>
    )
}