import { Space, Typography, Form, Input, Button, Divider } from 'antd'
import { useWorkspacesAPI } from '../../../../contexts'
import { UserAvatarUpload } from '../../../../components/layout'
import './account-profile-tab.css'

const { Title, Text } = Typography

export const AccountProfileTab = ({ }) => {
    const { user } = useWorkspacesAPI()!
    return (
        <Space direction="vertical">
            <Title level={ 5 }>General information</Title>
            <div style={{ display: "flex", alignItems: "flex-start", marginTop: 8 }}>
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
                <Form layout="vertical" className="account-profile-form" style={{ flexGrow: 1, marginLeft: 28 }}>
                    <Form.Item label="First name" style={{ display: "inline-block", width: "calc(50% - 4px)", marginRight: 8 }}>
                        <Input value={ user!.firstName } />
                    </Form.Item>
                    <Form.Item label="Last name" style={{ display: "inline-block", width: "calc(50% - 4px)" }}>
                        <Input value={ user!.lastName } />
                    </Form.Item>
                    <Form.Item label="Username" style={{ display: "inline-block", width: "calc(50% - 4px)", marginRight: 8, marginBottom: 0 }}>
                        <Input value={ user!.username } />
                    </Form.Item>
                    <Form.Item label="Email" style={{ display: "inline-block", width: "calc(50% - 4px)", marginBottom: 0 }}>
                        <Input type="email" value={ user!.email } />
                    </Form.Item>
                </Form>
            </div>
        </Space>
    )
}