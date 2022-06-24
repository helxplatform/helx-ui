import { useEffect, useState, useCallback, useMemo } from 'react'
import { Collapse, Divider, List, Space, Spin, Tag, Typography, Input } from 'antd'
import { ExpandAltOutlined, SearchOutlined } from '@ant-design/icons'
import { Link } from '../../../../link'
import { tokenizer } from 'elasticlunr'
import { useDebounce } from 'use-debounce'
import { useEnvironment } from '../../../../../contexts'
import { useElasticlunr } from '../../../../../hooks'
import { CdeItem } from './cde-item'
import './cdes.css'

const { Text, Title } = Typography
const { CheckableTag: CheckableFacet } = Tag
const { Panel } = Collapse

export const CdesTab = ({ cdes, cdeRelatedConcepts }) => {
  const [_search, setSearch] = useState("")
  const [search] = useDebounce(_search, 200)
  const { context } = useEnvironment()

  const loading = useMemo(() => cdes === null || cdeRelatedConcepts === null, [cdes, cdeRelatedConcepts])

  const populateIndex = useCallback((index) => {
    if (!loading) {
      cdes.elements.forEach((cde) => {
        index.addDoc({
          id: cde.id,
          name: cde.name,
          description: cde.description,
          concepts: Object.values(cdeRelatedConcepts[cde.id]).map((concept) => concept.name)
        })
      })
    }
  }, [loading, cdes, cdeRelatedConcepts])
  const { index: cdeIndex } = useElasticlunr(
    function () {
      this.setRef("id")
      this.addField("name")
      this.addField("description")
      this.addField("concepts")
    },
    populateIndex
  )

  // const cdeIndex = useMemo(() => {
  //   const index = new Elasticlunr(function () {
  //     this.setRef("id")
  //     this.addField("name")
  //     this.addField("description")
  //     this.addField("concepts")
  //   })
  //   if (!loading) {
  //     cdes.elements.forEach((cde) => {
  //       index.addDoc({
  //         id: cde.id,
  //         name: cde.name,
  //         description: cde.description,
  //         concepts: Object.values(cdeRelatedConcepts[cde.id]).map((concept) => concept.name)
  //       })
  //     })
  //   }
  //   return index
  // }, [loading, cdes, cdeRelatedConcepts])

  const cdeSource = useMemo(() => {
    if (loading) return []
    if (search.length < 3) return cdes.elements

    const doSearch = (searchQuery) => {
      return cdeIndex.search(
        searchQuery,
        {
          fields: {
            name: { boost: 1 },
            description: { boost: 1 },
            concepts: { boost: 3 }
          }
        }
      )
    }
    const searchResults = doSearch(search)
    return searchResults.map(({ ref: id, score }) => cdes.elements.find((cde) => cde.id === id))
  }, [loading, cdeIndex, cdes, search])

  return (
    <Space direction="vertical">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title level={ 4 } style={{ margin: 0 }}>CDEs</Title>
        <Input
          style={{ width: "auto" }}
          allowClear
          value={_search}
          onChange={(e) => setSearch(e.target.value) }
          suffix={
            <div style={{ display: "flex", alignItems: "center", height: "100%"}}>
              <Divider type="vertical" style={{ height: "100%" }} />
              <SearchOutlined style={{ fontSize: "16px", marginLeft: "4px" }} />
            </div>
          }
        />
      </div>
      <List
        loading={loading}
        dataSource={cdeSource}
        renderItem={(cde) => (
          <CdeItem cde={ cde } cdeRelatedConcepts={ cdeRelatedConcepts } highlight={search.length >= 3 ? tokenizer(search) : []} />
        )}
      />
   </Space>
  )
}
