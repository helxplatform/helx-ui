import { Button, Card, Typography } from "antd";
import { ExportOutlined } from "@ant-design/icons"

const { Title, Text } = Typography

export const CommunitySupport = () => (
    <Card
    bordered
    hoverable
    className="community-support-card"
    actions={[
        <Button icon={ <ExportOutlined /> } href="https://community.helx.renci.org/invites/B2dnCA8xRi" target="_blank" rel="noopener noreferrer">Open</Button>
    ]}
    >
        <img src="http://www.cniins.com/files/2018/01/community-image.gif"/>
        <Card.Meta
            title={
                <Title level={3} style={{ whiteSpace: "normal", marginBottom: "8px" }}>Community Support</Title>
            }
            description={
                <Text>Need help? Ask questions using your community's Discourse forum.</Text>
            }
        />
    </Card>
)