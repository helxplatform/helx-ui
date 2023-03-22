import { useRef, ReactNode, HTMLAttributes, useCallback } from "react"
import { Avatar, AvatarProps, Button, Dropdown, Popover, Typography } from "antd"
import { useAnalytics, useWorkspacesAPI } from "../../contexts"

const { Title } = Typography

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
    const { api } = useWorkspacesAPI()!
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0" }}>
                    <UserAvatarIcon size="large" />
                    <Title
                        level={ 5 }
                        style={{
                            margin: 0,
                            fontSize: 12,
                            letterSpacing: "0.5px",
                            color: "#434343",
                            textTransform: "uppercase",
                        }}
                    >
                        test
                    </Title>
                </div>
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