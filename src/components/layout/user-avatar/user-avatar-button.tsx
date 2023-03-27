import { useState } from 'react'
import { UserAvatarIcon } from './user-avatar-icon'
import { UserAvatarPopover } from './user-avatar-popover'
import { useWorkspacesAPI } from '../../../contexts'

export const UserAvatarButton = ({ }) => {
    const [visible, setVisible] = useState<boolean>(false)
    const { api, loading: apiLoading, loggedIn, user } = useWorkspacesAPI()!
    return (
        <UserAvatarPopover visible={ visible } onOpenChange={ setVisible }>
            <UserAvatarIcon size="large" style={{ cursor: "pointer", margin: "0 1rem 0 0.5rem" }} />
        </UserAvatarPopover>
    )
}