import { useCallback, useMemo } from 'react'
import { Menu, PopoverProps } from 'antd'
import { UserOutlined, ExportOutlined, ControlOutlined } from '@ant-design/icons'
import { useAnalytics, useWorkspacesAPI } from '../../../../contexts'
import './user-avatar-popover-menu.css'

const { useNavigate } = require('@gatsbyjs/reach-router')

interface UserAvatarPopoverMenuProps {
    onOpenChange: PopoverProps["onOpenChange"]
}

export const UserAvatarPopoverMenu = ({ onOpenChange }: UserAvatarPopoverMenuProps) => {
    const { api, user } = useWorkspacesAPI()!
    const { analyticsEvents } = useAnalytics()
    const navigate = useNavigate()

    const canViewAdminPanel = useMemo(() => user?.staff || user?.superuser, [user])

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
                    ...(canViewAdminPanel ? [{
                        key: 'admin-page',
                        icon: <ControlOutlined />,
                        label: 'Admin',
                        onClick: () => { window.location.href = `/admin` }
                    }] : []),
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