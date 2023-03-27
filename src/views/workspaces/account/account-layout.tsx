import { Layout, Menu } from 'antd'
import { UserOutlined, BellOutlined, LockOutlined, ShareAltOutlined } from '@ant-design/icons'
import { AccountConnectionsTab, AccountNotificationsTab, AccountPasswordTab, AccountProfileTab } from './tabs'

const { useNavigate } = require('@gatsbyjs/reach-router')

const { Sider, Content } = Layout

const baseAccountPath = "/helx/workspaces/account"

interface AccountLayoutProps {
    tab: string
}

export const AccountLayout = ({ tab }: AccountLayoutProps) => {
    const navigate = useNavigate()

    return (
        <Layout className="account-layout">
            <Sider>
                <Menu
                    className="account-tabs-menu"
                    mode="inline"
                    selectedKeys={ [ tab ] }
                    items={[
                        {
                            key: "profile",
                            label: "Account",
                            icon: <UserOutlined />,
                            onClick: () => navigate(`${ baseAccountPath }`)
                        },
                        {
                            key: "password",
                            label: "Password",
                            icon: <LockOutlined />,
                            onClick: () => navigate(`${ baseAccountPath }/password`)
                        },
                        {
                            key: "notifications",
                            label: "Notifications",
                            icon: <BellOutlined />,
                            onClick: () => navigate(`${ baseAccountPath }/notifications`)
                        },
                        {
                            key: "connections",
                            label: "Connections",
                            icon: <ShareAltOutlined />,
                            onClick: () => navigate(`${ baseAccountPath }/connections`)
                        }
                    ]}
                    onSelect={ ({ key }) => {
                    } }
                />
            </Sider>
            <Content>
                { tab === "profile" ? (
                    <AccountProfileTab />
                ) : tab === "password" ? (
                    <AccountPasswordTab />
                ) : tab === "notifications" ? (
                    <AccountNotificationsTab />
                ) : tab === "connections" ? (
                    <AccountConnectionsTab />
                ) : null }
            </Content>
        </Layout>
    )
}