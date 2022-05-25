import { Button, Card, Typography } from "antd";
import { ExportOutlined } from "@ant-design/icons"

const { Title, Text } = Typography

export const CommunitySupport = () => (
    <Card
    bordered
    hoverable
    className="community-support-card"
    actions={[
        <Button icon={ <ExportOutlined /> }>Open</Button>
    ]}
    >
        <img src="http://www.cniins.com/files/2018/01/community-image.gif"/>
        <Card.Meta
            title={
            <Title level={3} style={{ whiteSpace: "normal", marginBottom: "8px" }}>Community Support</Title>
            }
            description={
            <Text>Familiarize yourself with Dug, our semantic search tool.</Text>
            }
        />
    </Card>
)