import { Card, Space } from 'antd'

const { Meta } = Card

export const OverviewTab = ({ result }) => {

  return (
    <Space direction="vertical" className="tab-content">
      <Meta description={ result.description } className="description" />
    </Space>
  )
}
