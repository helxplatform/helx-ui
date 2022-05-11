import { useEffect, useState } from 'react'
import { List, Spin, Space, Tag, Typography } from 'antd'
import { useHelxSearch } from '../'
import { Link } from '../../link'

const { Text } = Typography

export const CdesTab = ({ result }) => {
  const { query, fetchCDEs } = useHelxSearch()
  const [cdes, setCDEs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getCDEs = async () => {
      const data = await fetchCDEs(result.id, query)
      setCDEs(data)
      setLoading(false)
    }
    setLoading(true)
    getCDEs()
  }, [fetchCDEs])

  console.log(cdes)

  if (loading) {
    return <Spin />
  }
  
  return (
    <Space direction="vertical" className="tab-content">
      <List
        className="studies-list"
        dataSource={ cdes.elements }
        renderItem={ item => (
          <List.Item>
            <Text className="study-name">{ item.name }{ ` ` }</Text>
          </List.Item>
        ) }
      />
    </Space>
  )
}
