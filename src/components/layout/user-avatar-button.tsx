import { useRef, ReactNode } from "react"
import { Avatar, Button, Dropdown, Popover, Typography } from "antd"
import { useWorkspacesAPI } from "../../contexts"

const { Title } = Typography

interface UserAvatarButtonPopoverProps {
    children: ReactNode
}

export const UserAvatarButtonPopover = ({ children }: UserAvatarButtonPopoverProps) => {
    const popoverRef = useRef()
    
    return (
        <Popover
            overlayClassName="user-avatar-popover"
            ref={ popoverRef }
            title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0" }}>
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
                    <Button type="primary" ghost className="logout-button" onClick={ () => null }>LOG OUT</Button>
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
            <Avatar style={{ cursor: "pointer", margin: "0 1rem 0 0.5rem" }}>test</Avatar>
        </UserAvatarButtonPopover>   
    )
}