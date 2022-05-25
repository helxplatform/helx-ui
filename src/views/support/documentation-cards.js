import { Button, Card, Typography } from "antd";
import { ExportOutlined } from "@ant-design/icons"

const { Title, Text } = Typography

export const UsingDug = () => (
    <Card
      bordered
      hoverable
      className="using-dug-card"
      actions={[
        <Button icon={ <ExportOutlined /> }>Open</Button>
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
        <Button icon={ <ExportOutlined /> }>Open</Button>
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
        <Button icon={ <ExportOutlined /> }>Open</Button>
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