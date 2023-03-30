import { useState } from 'react'
import { Button } from 'antd'
import { UploadOutlined, CameraOutlined } from '@ant-design/icons'
import { UserAvatarIcon, UserAvatarIconProps } from '../user-avatar-icon'
import { ChangeAvatarModal } from './change-avatar-modal'
import './user-avatar-upload.css'


interface UserAvatarUploadProps extends React.HTMLProps<HTMLDivElement> {
    cameraIcon?: boolean
    cameraIconSize?: number
    avatarIconProps?: UserAvatarIconProps
}

export const UserAvatarUpload = ({ cameraIcon=true, cameraIconSize=undefined, avatarIconProps={}, ...props }: UserAvatarUploadProps) => {
    const [open, setOpen] = useState<boolean>(false)
    
    const size = avatarIconProps.size ?? "default"
    const iconSize = cameraIconSize ? cameraIconSize
        : size === "small" ? 12
        : size === "default" ? 16
        : size === "large" ? 20
        : typeof size === "number" ? size ** (2/3)
        // Not supporting breakpoints for this currently, could be done with useBreakpoint though.
        : 16

    return (
        <div className="user-avatar-upload" { ...props }>
            <UserAvatarIcon { ...avatarIconProps } />
            <div
                className="upload-icon"
                onClick={ () => setOpen(true) }
            >
                <UploadOutlined style={{ fontSize: iconSize }} />
            </div>
            { false && cameraIcon && (
                <Button
                    className="camera-button"
                    shape="circle"
                    size="large"
                    icon={ <CameraOutlined style={{  }} /> }
                    style={{ background: "rgba(245, 245, 245)" }}
                >
                </Button>
            ) }
            <ChangeAvatarModal open={ open } setOpen={ setOpen } />
        </div>
    )
}