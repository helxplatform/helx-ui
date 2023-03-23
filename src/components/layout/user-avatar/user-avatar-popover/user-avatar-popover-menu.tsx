import { useCallback } from 'react'
import { Menu } from 'antd'
import { LogoutOutlined, UserOutlined, ExportOutlined } from '@ant-design/icons'
import { useAnalytics, useWorkspacesAPI } from '../../../../contexts'
import './user-avatar-popover-menu.css'

const useNavigate = require('@gatsbyjs/reach-router').useNavigate

export const UserAvatarPopoverMenu = ({ }) => {
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