import { ReactNode } from 'react'
import { Button, ButtonProps } from 'antd'
import { InfoIcon, InfoIconProps } from './info-icon'

interface InfoButtonProps extends ButtonProps {
    iconProps?: InfoIconProps
}

export const InfoButton = ({
    iconProps={},
    ...buttonProps
}: InfoButtonProps) => {
    return (
        <Button
            className="info-button"
            type="text"
            size="small"
            shape="circle"
            icon={ <InfoIcon { ...iconProps } /> }
            {...buttonProps }
        />
    )
}