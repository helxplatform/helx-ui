import { Layout, Menu } from 'antd'
import { UserOutlined, BellOutlined, LockOutlined, ShareAltOutlined } from '@ant-design/icons'

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
                            title: "Profile",
                            label: "Profile",
                            icon: <UserOutlined />,
                            onClick: () => navigate(`${ baseAccountPath }`)
                        },
                        {
                            key: "password",
                            title: "Password",
                            label: "Password",
                            icon: <LockOutlined />,
                            onClick: () => navigate(`${ baseAccountPath }/password`)
                        },
                        {
                            key: "notifications",
                            title: "Notifications",
                            label: "Notifications",
                            icon: <BellOutlined />,
                            onClick: () => navigate(`${ baseAccountPath }/notifications`)
                        },
                        {
                            key: "connections",
                            title: "Connections",
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
                { tab }
            </Content>
        </Layout>
    )
}