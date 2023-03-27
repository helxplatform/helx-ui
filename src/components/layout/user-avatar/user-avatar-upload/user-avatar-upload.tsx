import { UploadOutlined } from '@ant-design/icons'
import { UserAvatarIcon, UserAvatarIconProps } from '../user-avatar-icon'
import './user-avatar-upload.css'

interface UserAvatarUploadProps extends React.HTMLProps<HTMLDivElement> {
    avatarIconProps: UserAvatarIconProps
}

export const UserAvatarUpload = ({ avatarIconProps, ...props }: UserAvatarUploadProps) => {
    return (
        <div className="user-avatar-upload" { ...props }>
            <UserAvatarIcon { ...avatarIconProps } />
            <div className="upload-icon">
                <UploadOutlined style={{ fontSize: 24 }} />
            </div>
        </div>
    )
}