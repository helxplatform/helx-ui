import { useEffect, useState, useCallback, useMemo } from 'react'
import { Collapse, Divider, List, Space, Spin, Tag, Typography, Input } from 'antd'
import { ExpandAltOutlined, SearchOutlined } from '@ant-design/icons'
import { Link } from '../../../../link'
import lunr, { tokenizer } from 'lunr'
import { useDebounce } from 'use-debounce'
import { useEnvironment } from '../../../../../contexts'
import { useLunr } from '../../../../../hooks'
import { CdeItem } from './cde-item'
import './cdes.css'

window.lunr = lunr

const { Text, Title } = Typography
const { CheckableTag: CheckableFacet } = Tag
const { Panel } = Collapse

export const CdesTab = ({ cdes, cdeRelatedConcepts }) => {
  const [_search, setSearch] = useState("")
  const [search] = useDebounce(_search, 200)
  const { context } = useEnvironment()

  const loading = useMemo(() => cdes === null || cdeRelatedConcepts === null, [cdes, cdeRelatedConcepts])

  const docs = useMemo(() => {
    if (!loading) {
      return cdes.elements.map((cde) => ({
        id: cde.id,
        name: cde.name,
        description: cde.description,
        // Lunr supports array fields, though it expects the user to tokenize the elements themselves.
        // Instead, just join the concepts into a string and let lunr tokenize it instead.
        // See: https://stackoverflow.com/a/43562885
        concepts: Object.values(cdeRelatedConcepts[cde.id]).map((concept) => concept.name).join(" ")
      }))
    } else return []
  }, [loading, cdes, cdeRelatedConcepts])

  const initIndex = useCallback(function () {
    console.log("1) initialize index")
    this.ref("id")
    this.field("name")
    this.field("description")
    this.field("concepts")
    this.metadataWhitelist = ["position"]
  }, [docs])
  const populateIndex = useCallback((index) => {
    console.log("2) populate index")
    docs.forEach((doc) => {
      console.log("-- add doc")
      index.add(doc)
    })
  }, [docs])
  
  const { index: cdeIndex, lexicalSearch } = useLunr(
    initIndex,
    populateIndex
  )

  const [cdeSource, highlightTokens] = useMemo(() => {
    if (loading) return [[], []]
    if (search.length < 3) return [cdes.elements, []]

    const doSearch = (searchQuery) => {
      return cdeIndex.search(
        searchQuery
      )
    }
    const searchResults = lexicalSearch(search)
    // const highlightedSearchTokens = searchResults.flatMap(({ matchData }) => Object.keys(matchData.metadata) )

    // This solution is quite resource heavy and just not very good.
    // const highlightedSearchTokens = tokenizer(search)
    //   .flatMap(({ str: token }) => (
    //     lunr.TokenSet.fromFuzzyString(token, 1).toArray()
    //   ))
    //   .filter((token) => token.length >= 3)
    //   .map((token) => token.replace("*", "."))
    //   .map((token) => new RegExp(token))
    const highlightedSearchTokens = []
    const matchedCdes = searchResults.map(({ ref: id, score, matchData: { metadata } }) => {
      const cde = cdes.elements.find((cde) => cde.id === id)
      const internalDoc = docs.find((doc) => doc.id === id)
      Object.entries(metadata).forEach(([partialTerm, hitFields]) => {
        Object.entries(hitFields).forEach(([ field, meta ]) => {
          const { position: [[start, length]] } = meta
          const fieldValue = internalDoc[field]
          const fullTerm = fieldValue.slice(start, start + length)
          highlightedSearchTokens.push(fullTerm)
        })
      })
      return cde
    })
    console.log(highlightedSearchTokens)
    console.log(searchResults)
    return [ matchedCdes, highlightedSearchTokens ]
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
          <CdeItem cde={ cde } cdeRelatedConcepts={ cdeRelatedConcepts } highlight={highlightTokens} />
        )}
      />
   </Space>
  )
}
