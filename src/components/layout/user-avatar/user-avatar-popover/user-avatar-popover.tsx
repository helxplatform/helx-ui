import { ReactNode } from 'react'
import { Popover, PopoverProps, Space, Typography } from 'antd'
import { UserAvatarPopoverMenu } from './user-avatar-popover-menu'
import { UserAvatarPopoverHeader } from './user-avatar-popover-header'
import { UserAvatarIcon } from '../user-avatar-icon'
import { useWorkspacesAPI } from '../../../../contexts'
import './user-avatar-popover.css'

const { Title, Text } = Typography

interface UserAvatarButtonPopoverProps extends PopoverProps {
    children: ReactNode
}

export const UserAvatarPopover = ({ children, onOpenChange, ...props }: UserAvatarButtonPopoverProps) => {
    const { api, user } = useWorkspacesAPI()!
    
    return (
        <Popover
            overlayClassName="user-avatar-popover"
            placement="bottomRight"
            title={
                <UserAvatarPopoverHeader />
            }
            content={
                <UserAvatarPopoverMenu onOpenChange={ onOpenChange } />
            }
            trigger="click"
            onOpenChange={ onOpenChange }
            overlayStyle={{ minWidth: 300 }}
            { ...props }
        >
            { children }
        </Popover>
    )
}