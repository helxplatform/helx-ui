import { Space, Typography } from 'antd'
import { KnowledgeGraphs } from '../../'

const { Title } = Typography

export const KnowledgeGraphsTab = ({ graphs }) => {
  return (
    <Space direction="vertical">
      <Title level={ 4 }>Knowledge Graphs</Title>
      <KnowledgeGraphs graphs={ graphs } />
    </Space>    
  )
}