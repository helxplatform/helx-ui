import { useMemo, Ref } from 'react'
import { InfoCircleFilled, InfoCircleOutlined } from '@ant-design/icons'
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon'

export interface InfoIconProps extends AntdIconProps {
    filled?: boolean
    ref?: Ref<HTMLSpanElement>
}

export const InfoIcon = ({ filled=true, style, ...other }: InfoIconProps) => {
    const Icon = useMemo(() => filled ? InfoCircleFilled : InfoCircleOutlined, [filled])
    return (
        <Icon
            className="info-circle"
            style={{
                fontSize: 16,
                color: "rgb(85, 85, 85)",
                ...style
            }}
            { ...other }
        />
    )
}