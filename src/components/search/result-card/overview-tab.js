import { Card, Space } from 'antd'
import { useHelxSearch } from '../'

const { Meta } = Card

export const OverviewTab = ({ result }) => {
  return (
    <Space direction="vertical" className="tab-content">
      <Meta description={ result.description } className="description" />
    </Space>
  )
}
