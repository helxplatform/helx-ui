import { useEffect, useState } from 'react'
import { BarChartOutlined as ChartViewIcon } from '@ant-design/icons'
import { List, Spin, Space, Tag, Typography } from 'antd'
import { useHelxSearch } from '../'
import { Link } from '../../link'

const { Text } = Typography
const { CheckableTag: CheckableFacet } = Tag

export const StudiesTab = ({ result }) => {
  const { query, fetchVariablesForConceptId } = useHelxSearch()
  const [studyVariables, setStudyVariables] = useState([])
  const [facets, setFacets] = useState([])
  const [selectedFacets, setSelectedFacets] = useState([])
  const [loading, setLoading] = useState(true)

  const handleSelectFacet = (facet, checked) => {
    const newSelection = new Set(selectedFacets)
    if (newSelection.has(facet)) {
      newSelection.delete(facet)
    } else {
      newSelection.add(facet)
    }
    setSelectedFacets([...newSelection])
  }

  useEffect(() => {
    const getVars = async () => {
      const { result: data } = await fetchVariablesForConceptId(result.id, query)
      setStudyVariables(data)
      setFacets(Object.keys(data))
      setSelectedFacets(Object.keys(data))
      setLoading(false)
    }
    getVars()
  }, [fetchVariablesForConceptId, query, result.id])

  if (loading) {
    return <Spin />
  }

  return (
    <Space direction="vertical" className="tab-content">
      <Space direction="horizontal" size="small">
        {
          facets.map(facet => studyVariables[facet] && (
            <CheckableFacet
              key={`search-facet-${facet}`}
              checked={selectedFacets.includes(facet)}
              onChange={checked => handleSelectFacet(facet, checked)}
              children={`${facet} (${studyVariables[facet].length})`}
            />
          ))
        }
      </Space>
      <List
        className="studies-list"
        dataSource={
          Object.keys(studyVariables)
            .filter(facet => selectedFacets.includes(facet))
            .reduce((arr, facet) => [...arr, ...studyVariables[facet]], [])
            .sort((s, t) => s.c_name < t.c_name ? -1 : 1)
        }
        renderItem={item => (
          <List.Item>
            <div className="studies-list-item">
              <Text className="study-name">
                {item.c_name}{` `}
                (<Link to={item.c_link}>{item.c_id}</Link>)
              </Text>
              <Text className="variables-count">{item.elements.length} variable{item.elements.length === 1 ? '' : 's'}</Text>
            </div>
          </List.Item>
        )}
      />
    </Space>
  )
}
