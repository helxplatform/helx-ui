import { Space, Typography } from 'antd'
import { UserAvatarIcon } from '../user-avatar-icon'
import { useWorkspacesAPI } from '../../../../contexts'

const { Title, Text } = Typography

export const UserAvatarPopoverHeader = ({ }) => {
    const { user } = useWorkspacesAPI()!
    return (
        <Space size={ 12 } style={{ margin: "8px 0"  }}>
            <UserAvatarIcon shape="circle" size={ 48 } />
            <Space direction="vertical" size={ 0 }>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Title
                        level={ 5 }
                        style={{
                            margin: 0,
                            fontSize: 15,
                            display: "inline"
                        }}
                    >
                        {/* First/last name may be blank strings, but username is always set for a user. */}
                        { user!.firstName && user!.lastName ? (
                            `${ user!.firstName } ${ user!.lastName }`
                        ) : (
                            user!.username
                        ) }
                    </Title>
                    {/* <Text style={{
                        fontSize: 13,
                        fontWeight: 400
                    }}>
                        &nbsp;({ user!.username })
                    </Text> */}
                </div>
                { user!.email && <Text type="secondary" style={{ fontWeight: 400, fontSize: 13 }}>
                    { user!.email }
                </Text> }
                {/* Idea in case Dug/HeLx authentication is unified */}
                {/* <Text type="secondary" style={{ fontWeight: 400, fontSize: 13 }}>HeLx Workspaces</Text> */}
            </Space>
        </Space>
    )
}