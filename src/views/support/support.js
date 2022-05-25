import { Fragment, useMemo } from 'react'
import { Typography, Card, Space, Divider, Button, Grid, List } from 'antd'
import { ExportOutlined } from '@ant-design/icons'
import { useEnvironment } from '../../contexts'
import { Breadcrumbs } from '../../components/layout'
import { GettingStarted, TechnicalDocs, UsingDug } from './documentation-cards'
import { CommunitySupport } from './community-cards'
import './support.css'

const { Title, Link, Text } = Typography
const { useBreakpoint } = Grid

// Support page sections can be hidden using hidden_sections in the configuration. <community, support>

export const SupportView = () => {
  const { context } = useEnvironment()
  const { sm, md, lg, xl, xxl } = useBreakpoint()

  const supportCards = useMemo(() => {
    const hiddenSupportSections = Array.isArray(context.hidden_support_sections) ? context.hidden_support_sections : []
    const supportSections = ["community", "documentation"].filter((section) => !hiddenSupportSections.includes(section))
    return supportSections.reduce((acc, cur) => {
      if (cur === "community") {
        acc.push(
          <CommunitySupport />
        )
      }
      if (cur === "documentation") {
        acc.push(
          <UsingDug />,
          <GettingStarted />,
          <TechnicalDocs />
        )
      }
      return acc
    }, [])
  }, [context.hidden_support_sections])
  const breakpointColumns = (
    xl ? 4 : (
      lg ? 3 : (
        md ? 2 : (
          sm ? 1 : 1
        )
      )
    )
  );
  console.log(lg)
  // If there are only 4 cards, even if the layout has room for 6, only want it to use 4.
  const column = Math.min(breakpointColumns, supportCards.length)

  return (
    <Space direction="vertical" size="middle" className="support-page">
      <Title level={1}>Support</Title>
      <List
        grid={{
          gutter: 16,
          // column = # of columns per row
          column
        }}
        className={`support-card-grid ${!md ? "mobile" : ""}`}
        dataSource={supportCards}
        renderItem={(item) => (
          <List.Item>
            {item}
          </List.Item>
        )}
      >
        {/* {!context.hidden_support_sections.includes('community') && <CommunitySupport />} */}
        {/* {!context.hidden_support_sections.includes('documentation') && <Documentation />} */}
      </List>
    </Space>
  )
}