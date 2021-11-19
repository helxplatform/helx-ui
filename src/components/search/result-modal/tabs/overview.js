import { Space, Typography } from 'antd'

const { Text, Title } = Typography

export const OverviewTab = ({ result }) => {
  return (
    <Space direction="vertical">
      <Title level={ 4 }>Overview</Title>
      <Text>{ result.description }</Text>
    </Space>
  )
}
