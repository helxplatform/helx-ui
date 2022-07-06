import { useEffect, useState, useCallback, useMemo } from 'react'
import { Collapse, Divider, List, Space, Spin, Tag, Typography, Input } from 'antd'
import { ExpandAltOutlined, SearchOutlined } from '@ant-design/icons'
import { useEnvironment } from '../../../../../contexts'
import { useLunrSearch } from '../../../../../hooks'
import { CdeList } from './cde-list'
import { DebouncedInput } from '../../../../'
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

    const { hits, tokens } = lexicalSearch(search, {
      prefixSearch: true,
      // Give an extra edit of fuzziness to terms longer than 4 characters.
      fuzziness: (term) => term.length >= 5 ? 2 : 1
    })
    const matchedCdes = hits.map(({ ref: id }) => cdes.elements.find((cde) => cde.id === id))
    return [ matchedCdes, tokens ]
  }, [loading, cdeIndex, cdes, search])

  return (
    <Space direction="vertical">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title level={ 4 } style={{ margin: 0 }}>CDEs</Title>
        <DebouncedInput setValue={setSearch}/>
      </div>
      <CdeList cdes={cdeSource} cdeRelatedConcepts={cdeRelatedConcepts} highlight={highlightTokens} loading={loading}/>
   </Space>
  )
}
