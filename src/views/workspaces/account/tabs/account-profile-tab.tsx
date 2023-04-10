import { useMemo } from 'react'
import { Space, Typography, Form, Input, Button, Divider, Tag, Tooltip } from 'antd'
import { useWorkspacesAPI } from '../../../../contexts'
import { UserAvatarUpload } from '../../../../components/layout'
import './account-profile-tab.css'

const { Title, Text } = Typography

export const AccountProfileTab = ({ }) => {
    const { user } = useWorkspacesAPI()!
    // Somewhat of a stand-in since we have a very rudimentary role system right now.
    const roles = useMemo(() => {
        if (!user) return []
        const roles = []
        roles.push({
            name: "user",
            description: "Standard access to apps and system resources.",
            color: "magenta"
        })
        if (user.staff) roles.push({
            name: "staff",
            description: "Access to certain administrative functions.",
            color: "purple"
        })
        if (user.superuser) roles.push({
            name: "admin",
            description: "Full access to to all administrative functions.",
            color: "geekblue"
        })
        return roles
    }, [user])
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <Divider orientation="left" orientationMargin={ 0 } style={{ marginBottom: 24 }}>General information</Divider>
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <UserAvatarUpload
                        avatarIconProps={{
                            shape: "circle",
                            size: 140 - 12 - 24
                        }}
                        style={{ flexGrow: 1, filter: "drop-shadow(0 0 0.5px rgba(0, 0, 0, 1)" }}
                    />
                    <Button block type="ghost" size="small" style={{ marginTop: 12 }}>Remove</Button>
                </div>
                {/* <Divider type="vertical" style={{ height: "100%", margin: "0 24px"}} /> */}
                <Form layout="vertical" className="account-profile-form" style={{ flexGrow: 1, marginLeft: 24 }}>
                    <Form.Item label="First name">
                        <Input value={ user!.firstName } />
                    </Form.Item>
                    <Form.Item label="Last name" style={{ marginBottom: 0 }}>
                        <Input value={ user!.lastName } />
                    </Form.Item>
                </Form>
            </div>
            <Form layout="vertical" className="account-profile-form" style={{ flexGrow: 1 }}>
                <Form.Item label="Username">
                    <Input value={ user!.username } />
                </Form.Item>
                <Form.Item label="Email" style={{ marginBottom: 0 }}>
                    <Input type="email" value={ user!.email } />
                </Form.Item>
            </Form>
            <Divider orientation="left" orientationMargin={ 0 } style={{ marginBottom: 12 }}>User roles</Divider>
            <Space size={[ 0, 8 ]} wrap>
                { roles.map((role, i) => (
                    <Tooltip title={ role.description } placement="bottom">
                        <Tag color={ role.color }>{ role.name }</Tag>
                    </Tooltip>
                )) }
            </Space>
        </div>
    )
}