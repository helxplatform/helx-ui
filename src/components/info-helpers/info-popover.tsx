import { ReactNode } from 'react'
import { Popover, PopoverProps } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon'
import { InfoIcon, InfoIconProps } from './info-icon'

type InfoPopoverProps = PopoverProps & {
    iconProps?: InfoIconProps
}

export const InfoPopover = ({
    iconProps={},
    ...popoverProps
}: InfoPopoverProps) => {
    return (
        <Popover
            className="info-popover"
            trigger="click"
            {...popoverProps }
        >
            <InfoIcon { ...iconProps } />
        </Popover>
    )
}