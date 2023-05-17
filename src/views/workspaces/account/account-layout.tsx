import { Layout, Menu } from 'antd'
import { UserOutlined, BellOutlined, LockOutlined, ShareAltOutlined, ControlOutlined } from '@ant-design/icons'
import { AccountConnectionsTab, AccountNotificationsTab, AccountPasswordTab, AccountProfileTab } from './tabs'
import { useWorkspacesAPI } from '../../../contexts'

const { useNavigate } = require('@gatsbyjs/reach-router')

const { Sider, Content } = Layout

const baseAccountPath = "/helx/workspaces/account"

interface AccountLayoutProps {
    tab: string
}

export const AccountLayout = ({ tab }: AccountLayoutProps) => {
    const { userCanViewAdmin } = useWorkspacesAPI()!
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
                        },
                        /** This has been fleshed out as a stub in case there is a need for additional administrative controls for staff accounts
                         * beyond the capabilities of the Django admin panel. Currently there isn't any asks for such a thing though, so it's disabled.
                         */
                        ...(userCanViewAdmin && false ? [{
                            key: "administrative",
                            label: "Administrative",
                            icon: <ControlOutlined />,
                            onClick: () => navigate(`${ baseAccountPath}/administrative`)
                        }] : [])
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