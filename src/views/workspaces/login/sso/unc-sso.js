import Icon from '@ant-design/icons'
import { Button } from 'antd'
import { SSOButton } from './sso-button'
import UncPng from './old-well3-crop.png'

export const UNCSSO = ({  }) => {
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
        >
            UNC
        </SSOButton>
    )
}