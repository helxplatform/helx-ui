import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { List, Spin, Space, Tag, Typography, Divider } from 'antd'
import { useAnalytics } from '../../../contexts'
import { Link } from '../../link'

const { Text } = Typography
const { CheckableTag: CheckableFacet } = Tag

export const StudiesTab = ({ studies }) => {
  const { analyticsEvents } = useAnalytics()
  const [facets, setFacets] = useState([])
  const [selectedFacets, setSelectedFacets] = useState([])

  const loading = useMemo(() => studies === null, [studies])

  const studiesSource = useMemo(() => (
    studies ? (
      studies.filter((study) => selectedFacets.includes(study.type))
    ) : (
      []
  )), [studies, selectedFacets])

  const handleSelectFacet = useCallback((facet, checked) => {
    const newSelection = new Set(selectedFacets)
    if (newSelection.has(facet)) {
      newSelection.delete(facet)
    } else {
      newSelection.add(facet)
    }
    setSelectedFacets([...newSelection])
  }, [selectedFacets])

  const studyLinkClicked = (studyId) => {
    analyticsEvents.studyLinkClicked(studyId)
  }

  useEffect(() => {
    const facets = (studies ?? []).reduce((acc, study) => {
      if (!acc.includes(study.type)) acc.push(study.type)
      return acc
    }, [])
    setFacets(facets)
    setSelectedFacets(facets)
  }, [studies])
  
  /*
  useEffect(() => {
    const getStudies = async () => {
      const studies = await fetchVariablesForConceptId(result.id, query)
      const cdes = await fetchCDEs(result.id, query)
      const cdesAsStudies = cdes ? cdes.elements.map((cde) => ({
        // c_id: cde.id,
        c_link: cde.e_link,
        c_name: cde.name,
        elements: null,
        type: "CDE"
      })) : []
      setStudies([
        ...studies,
        ...cdesAsStudies
      ])
      setLoading(false)
    }
    setLoading(true)
    getStudies()
  }, [fetchVariablesForConceptId])
  */

  if (loading) {
    return <Spin />
  }

  return (
    <Space direction="vertical" className="tab-content">
      <Space direction="horizontal" size="small">
        {/* <Text style={{ marginRight: "4px" }}>Studies:</Text> */}
        {
          facets.map((facet) => (
            <CheckableFacet
              key={ `search-facet-${ facet }` }
              style={ !selectedFacets.includes(facet) ? { border: "1px solid #d9d9d9", background: "#fafafa" } : {} }
              checked={ selectedFacets.includes(facet) }
              onChange={ (checked) => handleSelectFacet(facet, checked) }
            >
              { `${ facet } (${studies.filter((study) => study.type === facet).length})` }
            </CheckableFacet>
          ))
        }
      </Space>
      {/* <Divider style={{ marginTop: "8px", marginBottom: "8px" }} /> */}
      <List
        className="studies-list"
        dataSource={ studiesSource }
        renderItem={ study => (
          <List.Item className="studies-list-item">
            <Tag className="study-tag">{ study.type }</Tag>
            <Text className="study-name">
              { study.c_name }
              { (study.c_id && study.c_link) && (
                <Fragment>
                  { ` ` }
                  (<Link to={ study.c_link } onClick={ () => studyLinkClicked(study.c_id) }>{ study.c_id }</Link>)
                </Fragment>
              )}
            </Text>
            <Text className="variables-count">
              { study.elements && `${ study.elements.length } variable${ study.elements.length === 1 ? '' : 's'}` }
            </Text>
          </List.Item>
        )}
      />
    </Space>
  )
}
