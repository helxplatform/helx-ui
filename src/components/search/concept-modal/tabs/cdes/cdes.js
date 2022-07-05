import { useEffect, useState, useCallback, useMemo } from 'react'
import { Collapse, Divider, List, Space, Spin, Tag, Typography, Input } from 'antd'
import { ExpandAltOutlined, SearchOutlined } from '@ant-design/icons'
import { useEnvironment } from '../../../../../contexts'
import { useLunrSearch } from '../../../../../hooks'
import { CdeList } from './cde-list'
import { CdeSearch } from './cde-search'
import './cdes.css'

const { Text, Title } = Typography
const { CheckableTag: CheckableFacet } = Tag
const { Panel } = Collapse

export const CdesTab = ({ cdes, cdeRelatedConcepts }) => {
  const [search, setSearch] = useState("")
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
  
  const { index: cdeIndex, lexicalSearch } = useLunrSearch({
    docs,
    index: {
      ref: "id",
      fields: ["name", "description", "concepts"]
    }
  })

  const [cdeSource, highlightTokens] = useMemo(() => {
    if (loading) return [[], []]
    if (search.length < 3) return [cdes.elements, []]

    const searchResults = lexicalSearch(search, {
      prefixSearch: true,
      // Give an extra edit of fuzziness to terms longer than 4 characters.
      fuzziness: (term) => term.length >= 5 ? 2 : 1
    })
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
  console.log("rerender")
  return (
    <Space direction="vertical">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title level={ 4 } style={{ margin: 0 }}>CDEs</Title>
        <CdeSearch setSearch={setSearch}/>
      </div>
      <CdeList cdes={cdeSource} cdeRelatedConcepts={cdeRelatedConcepts} highlight={highlightTokens} loading={loading}/>
   </Space>
  )
}
