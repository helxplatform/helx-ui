import { Avatar, AvatarProps } from "antd"
import { useWorkspacesAPI } from "../../../contexts"

export interface UserAvatarIconProps extends AvatarProps {
}

export const UserAvatarIcon = ({ ...props }: UserAvatarIconProps) => {
    const { user } = useWorkspacesAPI()!
    return (
        <Avatar className="user-avatar-icon" src="https://a-z-animals.com/media/2018/09/Parrot-macaw-close-up.jpg" { ...props }>{ user?.username.charAt(0) }</Avatar>
    )
}