import { Space, Typography } from 'antd'

const { Title } = Typography

export const TranQLTab = ({ result }) => {
  return (
    <Space direction="vertical">
      <Title level={ 4 }>Overview</Title>
      <pre style={{ fontSize: '75%'}}>
        { JSON.stringify(result, null, 2) }
      </pre>
    </Space>
  )
}
