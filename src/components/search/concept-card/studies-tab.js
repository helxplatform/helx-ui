import { useEffect, useState } from 'react'
import { List, Spin, Space, Tag, Typography } from 'antd'
import { useHelxSearch } from '../'
import { Link } from '../../link'

const { Text } = Typography

export const StudiesTab = ({ result }) => {
  const { query, fetchStudyVariables } = useHelxSearch()
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getStudies = async () => {
      const studies = await fetchStudyVariables(result.id, query)
      setStudies(studies)
      setLoading(false)
    }
    setLoading(true)
    getStudies()
  }, [fetchStudyVariables])

  if (loading) {
    return <Spin />
  }
  
  return (
    <Space direction="vertical" className="tab-content">
      <List
        className="studies-list"
        dataSource={ studies }
        renderItem={ study => (
          <List.Item>
            <Text className="study-name">{ study.c_name }{ ` ` }</Text>
            <Text className="variables-count">
              { study.elements.length } variable{ study.elements.length === 1 ? '' : 's' }<br />
              <Tag>{ study.type }</Tag> <Link to={ study.c_link }>{ study.c_id }</Link>
            </Text>
          </List.Item>
        ) }
      />
    </Space>
  )
}
