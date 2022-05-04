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
  }, [fetchKnowledgeGraphs, query])

  if (loading || true) {
    return <Spin style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
  }

  return (
    <Space direction="vertical" className="tab-content">
      <KnowledgeGraphs graphs={ graphs } />
    </Space>
  )
}
