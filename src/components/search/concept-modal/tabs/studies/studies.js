import { useEffect, useMemo, useState } from 'react'
import { Collapse, List, Space, Tag, Typography } from 'antd'
import { Study } from './study'
import { DebouncedInput } from '../../../../'
import { useLunrSearch } from '../../../../../hooks'

const { Title } = Typography
const { CheckableTag: CheckableFacet } = Tag

export const StudiesTab = ({ studies }) => {
  const [search, setSearch] = useState("")
  const [facets, setFacets] = useState([])
  const [selectedFacets, setSelectedFacets] = useState([])
  const [activeStudyKeys, setActiveStudyKeys] = useState([])

  const docs = useMemo(() => {
    if (studies) {
      return Object.entries(studies).flatMap(([source, studies]) => (
        studies.map((study) => ({
          id: study.c_id,
          type: source,
          studyName: study.c_name,
          variableNames: study.elements.map((variable) => variable.name).join(" "),
          variableDescriptions: study.elements.map((variable) => variable.description).join(" ")
        }))
      ))
    } else return []
  }, [studies])

  const lunrConfig = useMemo(() => ({
    docs,
    index: {
      ref: "id",
      fields: [
        "type",
        "studyName",
        "variableNames",
        "variableDescriptions",
      ]
    }
  }), [docs])
  const { index, lexicalSearch } = useLunrSearch(lunrConfig)

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
    setFacets(Object.keys(studies))
    setSelectedFacets(Object.keys(studies))
  }, [studies])

  const [studiesSource, highlightTokens] = useMemo(() => {
    if (search.length < 3) return [studies, []]

    const { hits, tokens } = lexicalSearch(search)
    const hitIds = hits.map(({ ref }) => ref)
    const matchedStudies = Object.fromEntries(
      Object.entries(studies).map(([source, studies]) => ([
        source,
        studies.filter((study) => hitIds.includes(study.c_id))
      ]))
    )
    // const matchedStudies = hits.map(({ ref: id }) => Object.fromEntries(
    //   Object.entries(studies).map(([source, studies]) => ([
    //     source,
    //     studies.filter((study) => study.c_id === id)
    //   ]))
    // ))

    return [ matchedStudies, tokens ]
  }, [studies, search, lexicalSearch])

  const filteredStudiesSource = useMemo(() => (
    Object.keys(studiesSource)
      .filter(facet => selectedFacets.includes(facet))
      .reduce((arr, facet) => [...arr, ...studiesSource[facet]], [])
      .sort((s, t) => s.c_name < t.c_name ? -1 : 1)
  ), [studiesSource, selectedFacets])

  return (
    <Space direction="vertical">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <Title level={ 4 } style={{ margin: 0 }}>Studies</Title>
        <DebouncedInput setValue={setSearch}/>
      </div>
      <Space direction="horizontal" size="small">
        {
          facets.map(facet => {
            // If all the studies under the facet (study source) are filtered out by search,
            // the facet should be disabled.
            const isFiltered = studiesSource[facet]?.length === 0

            if (studiesSource[facet]) return (
              <CheckableFacet
                key={ `search-facet-${ facet }` }
                className="ant-btn"
                checked={ selectedFacets.includes(facet) }
                disabled={isFiltered}
                onChange={ checked => !isFiltered && handleSelectFacet(facet, checked) }
                children={ `${ facet } (${studiesSource[facet].length})` }
              />
            )
          })
        }
      </Space>
      <Collapse ghost className="variables-collapse" activeKey={activeStudyKeys} onChange={ (activeKeys) => setActiveStudyKeys(activeKeys) }>
        {
          filteredStudiesSource
            .map(item => (
              <Study
                key={ item.c_id }
                study={ item }
                highlight={ highlightTokens }
                collapsed={ !activeStudyKeys.includes(item.c_id) }
              />
            ))
        }
      </Collapse>
   </Space>
  )
}
