import { Card, Space, Spin } from 'antd'
import { useHelxSearch } from '../'

const { Meta } = Card

export const OverviewTab = ({ result }) => {
  const { query } = useHelxSearch()

  return (
    <Space direction="vertical" className="tab-content">
      <Meta description={ result.description } className="description" />
    </Space>
  )
}
