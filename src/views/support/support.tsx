import { Fragment, ReactNode, HTMLAttributes } from 'react'
import { Typography, Input, Divider, Card, Button, Form } from 'antd'
import { PhoneOutlined } from '@ant-design/icons'
import { TitleProps } from 'antd/lib/typography/Title'
import { SearchOutlined } from '@ant-design/icons'
import { useTitle } from '../'
import { useEnvironment } from '../../contexts'
import './support.css'
import { ModalForm } from '@ant-design/pro-form'

const { Title, Paragraph, Text } = Typography
const { Meta } = Card
const { useForm } = Form

interface SupportGroupTitleProps extends TitleProps {
    children: ReactNode
}

interface SupportGroupProps extends HTMLAttributes<HTMLDivElement> {
    header: ReactNode
    headerProps?: Partial<SupportGroupTitleProps>
    children: ReactNode | ReactNode[]
}

interface SupportGroupCardProps {
    header: ReactNode
    description: ReactNode
    imageUrl: string
}

interface SupportTicketForm {

}

interface SupportTicketFormModalProps {
    button: any
}

const SupportTicketFormModal = ({ button }: SupportTicketFormModalProps) => {
    const [form] = useForm<SupportTicketForm>()
    return (
        <ModalForm<SupportTicketForm>
            title="Submit a new support ticket"
            trigger={ button }
            form={ form }
            autoFocusFirstInput
            modalProps={{
                destroyOnClose: true,
                cancelText: "Cancel",
                okText: "Confirm",
                className: "support-ticket-form-modal"
            }}
            onFinish={ async (values) => {
                console.log(values)
            } }
        >

        </ModalForm>
    )
}

const SupportGroupCard = ({ header, description, imageUrl }: SupportGroupCardProps) => {
    return (
        <Card
            className="support-group-card"
            hoverable
            cover={ <img src={ imageUrl } /> }
            // actions={ [ <div key={ 1 } style={{ height: 24 }} /> ] }
        >
            <Meta
                title={ header }
                description={ description }
            />
        </Card>
    )
}

const SupportGroupTitle = ({ children, ...props }: SupportGroupTitleProps) => {
    return (
        <Title
            className="support-group-title"
            level={ 4 }
            { ...props }
        >
            { children }
        </Title>
    )
}

const SupportGroup = ({ header, children, headerProps={}, ...props }: SupportGroupProps) => {
    return (
        <div className="support-group" { ...props }>
            <SupportGroupTitle { ...headerProps }>{ header }</SupportGroupTitle>
            <div className="support-group-items">
                { children }
            </div>
        </div>
    )
}

export const SupportView = () => {
    const { context } = useEnvironment() as any
    useTitle("Support")
  
    return (
      <div className="support-view">
        <div className="support-view-header-container">
            <Title
                className="support-header"
                level={ 2 }
            >
                How can we help?
            </Title>
            { /*
            <Input
                className="support-search"
                placeholder="Search for a topic"
                suffix={ (
                    <div style={{ display: "flex", alignItems: "center", height: "100%"}}>
                    <Divider type="vertical" style={{ height: "100%", top: 0 }} />
                    <SearchOutlined style={{ fontSize: "16px", marginLeft: "4px" }} />
                    </div>
                ) }
            />
            */ }
        </div>
        <SupportGroup
            header={
                "Contact Us"
            }
            style={{ marginTop: 24 }}
            headerProps={{ style: { marginBottom: 12 } }}
        >
            <Paragraph style={{ fontSize: 15 }}>
                You can submit a <SupportTicketFormModal button={
                    <Button type="link" style={{ padding: 0 }}>support ticket</Button>
                } /> if you need help resolving issues,
                have any questions, or want to give us feedback about the platform.
            </Paragraph>
        </SupportGroup>
        <SupportGroup header="Getting Started">
            <SupportGroupCard
                header="Start Using Dug"
                description="The basics of using semantic search"
                imageUrl="data:image/png;base64,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"
            />
            <SupportGroupCard
                header="Working with Workspaces"
                description="Familiarize yourself with HeLx workspaces"
                imageUrl="/static/frontend/helx-cloud.png"
            />
        </SupportGroup>
        <SupportGroup header="General">
            <SupportGroupCard
                header="Semantic Search FAQs"
                description="Frequently asked questions about Dug"
                imageUrl="https://cdn-icons-png.flaticon.com/512/4403/4403555.png"
            />
            <SupportGroupCard
                header="Workspaces FAQs"
                description="Frequently asked questions about HeLx workspaces"
                imageUrl="https://cdn-icons-png.flaticon.com/512/4403/4403555.png"
            />
            <SupportGroupCard
                header="Developer Documentation"
                description="Technical documentation for developers"
                imageUrl="https://static.thenounproject.com/png/5340526-200.png"
            />
            
        </SupportGroup>
      </div>
    )
  }