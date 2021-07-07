import { useEffect, useState } from 'react'
import { Space, Spin } from 'antd'
import { KnowledgeGraphs, useHelxSearch } from '../'

export const KnowledgeGraphsTab = ({ result }) => {
  const { query, fetchKnowledgeGraphs } = useHelxSearch()
  const [graphs, setGraphs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getKgs = async () => {
      try {
        const kgs = await fetchKnowledgeGraphs(result.id)
        if (!kgs) {
          throw new Error('An error occurredwhile fetching knowledge graphs.')
        }
        setGraphs(kgs)
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    }
    getKgs()
  }, [fetchKnowledgeGraphs, query])

  if (loading) {
    return <Spin />
  }

  return (
    <Space direction="vertical" className="tab-content">
      <KnowledgeGraphs graphs={ graphs } />
    </Space>
  )
}
