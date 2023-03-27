import { useCallback } from 'react'
import { Menu, PopoverProps } from 'antd'
import { LogoutOutlined, UserOutlined, ExportOutlined } from '@ant-design/icons'
import { useAnalytics, useWorkspacesAPI } from '../../../../contexts'
import './user-avatar-popover-menu.css'

const useNavigate = require('@gatsbyjs/reach-router').useNavigate

interface UserAvatarPopoverMenuProps {
    onOpenChange: PopoverProps["onOpenChange"]
}

export const UserAvatarPopoverMenu = ({ onOpenChange }: UserAvatarPopoverMenuProps) => {
    const { api, user } = useWorkspacesAPI()!
    const { analyticsEvents } = useAnalytics()
    const navigate = useNavigate()

    const logout = useCallback(() => {
        analyticsEvents.logout()
        try {
            api.logout()
        } catch (e) {}
    }, [api, analyticsEvents])

    return (
        <div className="user-avatar-popover-menu" style={{ display: "flex" }}>
            <Menu
                selectedKeys={ [] }
                mode="inline"
                onClick={ () => onOpenChange && onOpenChange(false) }
                items={[
                    {
                        key: 'account-page',
                        icon: <UserOutlined />,
                        label: 'Account',
                        onClick: () => navigate(`/helx/workspaces/account`)
                    },
                    {
                        key: 'logout',
                        icon: <ExportOutlined />,
                        label: 'Logout',
                        onClick: () => logout()
                    }
                ]}
            />
        </div>
    )
}