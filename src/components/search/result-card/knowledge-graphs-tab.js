import { useEffect, useState } from 'react'
import { Space, Spin } from 'antd'
import { KnowledgeGraphs, useHelxSearch } from '../'

export const KnowledgeGraphsTab = ({ result }) => {
  const { query, fetchKnowledgeGraphs } = useHelxSearch()
  const [graphs, setGraphs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getKgs = async () => {
      const kgs = await fetchKnowledgeGraphs(result.id)
      setGraphs(kgs)
      setLoading(false)
    }
    getKgs()
  }, [fetchKnowledgeGraphs, query, result.id])

  if (loading) {
    return <Spin />
  }

  return (
    <Space direction="vertical" className="tab-content">
      <KnowledgeGraphs graphs={ graphs } />
    </Space>
  )
}
