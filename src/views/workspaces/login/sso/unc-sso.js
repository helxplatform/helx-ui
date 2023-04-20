import { useMemo } from 'react'
import Icon from '@ant-design/icons'
import { Button } from 'antd'
import { SAMLButton } from './sso-button'
import UncPng from './old-well3-crop.png'
import { useWorkspacesAPI } from '../../../../contexts'

export const UNCSSO = (props) => {
    const { api } = useWorkspacesAPI()

    /** There's a bug with the Icon component where it will rerender its component prop (thus reloading the src) every rerender */
    const icon = useMemo(() => (
        <Icon component={ () => (
            <img
                // width={ 24 }
                height={ 24 }
                src={ UncPng }
            />
        ) } />
    ), [])
    return (
        <SAMLButton
            icon={ icon }
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