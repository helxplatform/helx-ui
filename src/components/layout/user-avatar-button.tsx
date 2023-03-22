import { useRef, ReactNode, HTMLAttributes, useCallback } from "react"
import { Avatar, AvatarProps, Button, Dropdown, Popover, Space, Typography } from "antd"
import { grey } from "@ant-design/colors"
import { useAnalytics, useWorkspacesAPI } from "../../contexts"

const { Title, Text } = Typography

interface UserAvatarIconProps extends AvatarProps {
}

interface UserAvatarButtonPopoverProps {
    children: ReactNode
}

const UserAvatarIcon = ({ ...props }: UserAvatarIconProps) => {
    return (
        <Avatar { ...props }>test</Avatar>
    )
}

export const UserAvatarButtonPopover = ({ children }: UserAvatarButtonPopoverProps) => {
    const { api, user } = useWorkspacesAPI()!
    const { analyticsEvents } = useAnalytics()

    const logout = useCallback(() => {
        analyticsEvents.logout()
        try {
            api.logout()
        } catch (e) {}
    }, [api, analyticsEvents])
    
    return (
        <Popover
            overlayClassName="user-avatar-popover"
            title={
                <Space size={ 12 } style={{ margin: "8px 0" }}>
                    <UserAvatarIcon shape="circle" size={ 48 } />
                    <Space direction="vertical" size={ 2 }>
                        <Title
                            level={ 5 }
                            style={{
                                margin: 0,
                                fontSize: 14,
                                color: grey[6],
                                // letterSpacing: "0.5px",
                                // textTransform: "uppercase",
                            }}
                        >
                            { user!.username }
                        </Title>
                        { user!.firstName && user!.lastName && <Text style={{ color: grey[6], fontWeight: 400, fontSize: 13 }}>
                            { user!.firstName } { user!.lastName }
                        </Text> }
                        { user!.email && <Text type="secondary" style={{ fontWeight: 400, fontSize: 13 }}>
                            { user!.email }
                        </Text> }
                    </Space>
                </Space>
            }
            content={
                <div className="user-avatar-popover-content">
                    <Button type="primary" ghost block className="logout-button" onClick={ logout }>LOG OUT</Button>
                </div>
            }
            trigger="click"
            overlayStyle={{ minWidth: 300 }}
        >
            { children }
        </Popover>
    )
}

export const UserAvatarButton = ({ }) => {
    const { api, loading: apiLoading, loggedIn, user } = useWorkspacesAPI()!
    return (
        <UserAvatarButtonPopover>
            <UserAvatarIcon size="large" style={{ cursor: "pointer", margin: "0 1rem 0 0.5rem" }} />
        </UserAvatarButtonPopover>   
    )
}