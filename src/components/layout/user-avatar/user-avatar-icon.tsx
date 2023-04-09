import { Avatar, AvatarProps } from "antd"
import { useWorkspacesAPI } from "../../../contexts"

export interface UserAvatarIconProps extends AvatarProps {
    // Can be overriden
    src?: string
}

export const UserAvatarIcon = ({ src, ...props }: UserAvatarIconProps) => {
    const { user } = useWorkspacesAPI()!
    const profilePictureUrl = "https://a-z-animals.com/media/2018/09/Parrot-macaw-close-up.jpg"
    return (
        <Avatar className="user-avatar-icon" src={ src ?? profilePictureUrl } { ...props }>{ user?.username.charAt(0) }</Avatar>
    )
}