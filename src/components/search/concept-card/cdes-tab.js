import { Fragment, useEffect, useMemo, useState } from 'react'
import { List, Spin, Space, Typography, Divider } from 'antd'
import { useEnvironment } from '../../../contexts'
import { useHelxSearch } from '../'
import { Link } from '../../link'

const { Text, Paragraph } = Typography


export const CdesTab = ({ result }) => {
  const { basePath, context } = useEnvironment()
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
  }, [fetchCDEs, result.id, query])

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
            renderItem={ (item, i) => (
              <List.Item
                key={ `${ result.id }-cdes-${ item.name }` }
                style={{ paddingTop: i === 0 ? 0 : undefined }}
              >
                <Space direction="vertical" size="middle">
                  <List.Item.Meta
                    title={ item.name }
                    description={ item.description }
                  />
                </Space>
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
