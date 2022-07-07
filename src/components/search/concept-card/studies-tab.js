import { Fragment, useEffect, useMemo, useState } from 'react'
import { List, Spin, Space, Tag, Typography } from 'antd'
import { useHelxSearch } from '../'
import { Link } from '../../link'

const { Text } = Typography

export const StudiesTab = ({ result }) => {
  const { query, fetchStudyVariables, fetchCDEs } = useHelxSearch()
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)

  const facets = useMemo(() => studies.reduce((acc, study) => {
    if (!acc.includes(study.type)) acc.push(study.type)
    return acc
  }, []), [studies])
  
  useEffect(() => {
    const getStudies = async () => {
      const studies = await fetchStudyVariables(result.id, query)
      const cdes = await fetchCDEs(result.id, query)
      const cdesAsStudies = cdes ? cdes.elements.map((cde) => ({
        // c_id: cde.id,
        c_link: cde.e_link,
        c_name: cde.name,
        elements: null,
        type: "CDE"
      })) : []
      console.log(cdes)
      setStudies([
        ...studies,
        ...cdesAsStudies
      ])
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
      {/* <Space direction="horizontal" size="small">
        {
          facets.map(facet => studies[facet] && (
            <CheckableFacet
              key={ `search-facet-${ facet }` }
              checked={ selectedFacets.includes(facet) }
              onChange={ checked => handleSelectFacet(facet, checked) }
              children={ `${ facet } (${studies[facet].length})` }
            />
          ))
        }
      </Space> */}
      <List
        className="studies-list"
        dataSource={ studies }
        renderItem={ study => (
          <List.Item className="studies-list-item">
            <Tag className="study-tag">{ study.type }</Tag>
            <Text className="study-name">
              { study.c_name }
              { (study.c_id && study.c_link) && (
                <Fragment>
                  { ` ` }
                  (<Link to={ study.c_link }>{ study.c_id }</Link>)
                </Fragment>
              )}
            </Text>
            <Text className="variables-count">
              { study.elements && `${ study.elements.length } variable${ study.elements.length === 1 ? '' : 's'}` }
            </Text>
          </List.Item>
        ) }
      />
    </Space>
  )
}
