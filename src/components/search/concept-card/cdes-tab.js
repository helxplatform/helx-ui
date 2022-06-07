import { Fragment, useEffect, useMemo, useState } from 'react'
import { List, Spin, Space, Tag, Typography } from 'antd'
import { useEnvironment } from '../../../contexts'
import { useHelxSearch } from '../'
import { Link } from '../../link'

const { Text } = Typography

export const CdesTab = ({ result }) => {
  const { basePath } = useEnvironment()
  const { query, fetchCDEs } = useHelxSearch()
  const [cdes, setCDEs] = useState([])
  const [loading, setLoading] = useState(true)

  const synonymousConcepts = useMemo(() => {
    return result.identifiers
  }, [result])

  useEffect(() => {
    const getCDEs = async () => {
      const data = await fetchCDEs(result.id, query)
      setCDEs(data)
      setLoading(false)
    }
    setLoading(true)
    getCDEs()
  }, [fetchCDEs])

  if (loading) {
    return <Spin />
  }
  
  return (
    <Space direction="vertical" className="tab-content">
      {
        cdes ? (
          <List
            className="cdes-list"
            dataSource={ cdes.elements }
            renderItem={ item => (
              <List.Item
                key={ `${ result.id }-cdes-${ item.name }` }
              >
                <List.Item.Meta
                  title={ item.name }
                  description={ item.description }
                />
              </List.Item>
            ) }
          />
        ) : (
          <Text>No CDEs found.</Text>
        )
      }
      { /*
         * if any are present, render a comma-separated list of linked
         * related concepts, each of which initiates a new search.
         */
        !!synonymousConcepts.length && (
          <div>
            <Text>Related concepts: </Text>
            {
              synonymousConcepts.map((concept, i) => (
                <Fragment key={ `${ result.id }--${ concept.label }-link` }>
                  <Link to={ `${ basePath }search?q=${ concept.label }` }>
                    { concept.label }
                  </Link>
                  { i + 1 < synonymousConcepts.length && <span>, </span> }
                </Fragment>
              ))
            }
          </div>
        )
      }
    </Space>
  )
}
