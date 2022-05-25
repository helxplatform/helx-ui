import { Button, Card, Typography } from "antd";
import { ExportOutlined, RocketOutlined, ControlOutlined, UnorderedListOutlined } from "@ant-design/icons"

const { Title, Text } = Typography

export const UsingDug = () => (
    <Card
      bordered
      hoverable
      className="using-dug-card"
      actions={[
        <Button icon={ <ExportOutlined /> } href="https://helx.gitbook.io/helx-documentation/dug/" target="_blank" rel="noopener noreferrer">Open</Button>
      ]}
    >
      <img src="https://www.pinclipart.com/picdir/big/535-5351710_european-robin-transparent-background-clipart.png"/>
      <Card.Meta
        title={
          <Title level={3} style={{ whiteSpace: "normal", marginBottom: "8px" }}>Using Dug</Title>
        }
        description={
          <Text>Familiarize yourself with Dug, our semantic search tool.</Text>
        }
      />
    </Card>
)
export const GettingStarted = () => (
    <Card
      bordered
      hoverable
      className="getting-started-card"
      actions={[
        <Button icon={ <RocketOutlined /> } href="https://helx.gitbook.io/helx-documentation/helx/starting-an-existing-app" target="_blank" rel="noopener noreferrer">
          Launch
        </Button>,
        <Button icon={ <ControlOutlined /> } href="https://helx.gitbook.io/helx-documentation/helx/application-management" target="_blank" rel="noopener noreferrer">
          Manage
        </Button>,
        <Button icon={ <UnorderedListOutlined /> } href="https://helx.gitbook.io/helx-documentation/helx/helx-workspaces" target="_blank" rel="noopener noreferrer">
          Apps
        </Button>
      ]}
    >
      <img src="/static/frontend/kindpng_2545457-removebg-preview.png"/>
      {/* <img src="https://www.pinclipart.com/picdir/big/535-5351710_european-robin-transparent-background-clipart.png"/> */}
      <Card.Meta
        title={
          <Title level={2} style={{ whiteSpace: "normal", marginBottom: "8px" }}>Getting Started</Title>
        }
        description={
          <Text>Not sure how to manage your resources, launch an app, or find your data? Start here.</Text>
        }
      />
    </Card>
)
export const TechnicalDocs = () => (
    <Card
      bordered
      hoverable
      className="technical-docs-card"
      actions={[
        <Button icon={ <ExportOutlined /> } href="https://helx.gitbook.io/helx-documentation/dug/technical-documents" target="_blank" rel="noopener noreferrer">
          Dug
        </Button>,
        <Button icon={ <ExportOutlined /> } href="https://helx.gitbook.io/helx-documentation/helx/technical-documents" target="_blank" rel="noopener noreferrer">
          Workspaces
        </Button>
      ]}
      // style={{ marginRight: "16px" }}
    >
      <img src="https://ecdn.teacherspayteachers.com/thumbitem/Science-Owls-Clipart-3380601-1504878498/original-3380601-2.jpg"/>
      <Card.Meta
        title={
          <Title level={3} style={{ whiteSpace: "normal", marginBottom: "8px" }}>Technical Docs</Title>
        }
        description={
          <Text>Find our GitHub READMEs and more technical documentation here.</Text>
        }
      />
    </Card>
)