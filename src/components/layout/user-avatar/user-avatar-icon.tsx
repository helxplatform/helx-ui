import { Avatar, AvatarProps } from "antd"
import { useWorkspacesAPI } from "../../../contexts"

interface UserAvatarIconProps extends AvatarProps {
}

export const UserAvatarIcon = ({ ...props }: UserAvatarIconProps) => {
    const { user } = useWorkspacesAPI()!
    return (
        <Avatar { ...props }>{ user?.username.charAt(0) }</Avatar>
    )
}