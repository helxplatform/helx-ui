import { Tooltip, TooltipProps } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon'
import { ReactNode } from 'react'
import { InfoIcon, InfoIconProps } from './info-icon'

type InfoTooltipProps = TooltipProps & {
    iconProps?: InfoIconProps
}

export const InfoTooltip = ({
    iconProps={},
    ...tooltipProps
}: InfoTooltipProps) => {
    return (
        <Tooltip
            className="info-tooltip"
            trigger="click"
            {...tooltipProps }
        >
            <InfoIcon { ...iconProps } />
        </Tooltip>
    )
}