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

export const CdesTab = ({ cdes, cdeRelatedConcepts, cdeRelatedStudies, loading, error }) => {
  const [search, setSearch] = useState("")
  const { context } = useEnvironment()

  /** CDEs failed to load or loaded but no results. */
  const failed = useMemo(() => error && !cdes, [error, cdes])

  const docs = useMemo(() => {
    if (!loading && !failed) {
      return cdes.elements.map((cde) => ({
        id: cde.id,
        name: cde.name,
        description: cde.description,
        // Lunr supports array fields, though it expects the user to tokenize the elements themselves.
        // Instead, just join the concepts into a string and let lunr tokenize it instead.
        // See: https://stackoverflow.com/a/43562885
        concepts: Object.values(cdeRelatedConcepts[cde.id] ?? []).map((concept) => concept.name).join(" ")
      }))
    } else return []
  }, [loading, failed, cdes, cdeRelatedConcepts])
  
  const lunrConfig = useMemo(() => ({
    docs,
    index: {
      ref: "id",
      fields: ["name", "description", "concepts"]
    }
  }), [docs])
  const { index: cdeIndex, lexicalSearch } = useLunrSearch(lunrConfig)

  const [cdeSource, highlightTokens] = useMemo(() => {
    if (loading || failed) return [[], []]
    if (search.length < 3) return [cdes.elements, []]

    const { hits, tokens } = lexicalSearch(search)
    const matchedCdes = hits.map(({ ref: id }) => cdes.elements.find((cde) => cde.id === id))
    return [ matchedCdes, tokens ]
  }, [loading, failed, cdes, search, lexicalSearch])

  return (
    <Space direction="vertical">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title level={ 4 } style={{ margin: 0 }}>CDEs</Title>
        { !failed && !loading && <DebouncedInput setValue={setSearch}/> }
      </div>
      {/* { search && <Text style={{ display: "block", marginTop: "8px", marginBottom: "-16px", fontSize: 15, color: "rgba(0, 0, 0, 0.45)" }}>Search results for <i>{search.trim()}</i>:</Text> } */}
      <CdeList cdes={cdeSource} cdeRelatedConcepts={cdeRelatedConcepts} cdeRelatedStudies={cdeRelatedStudies} highlight={highlightTokens} loading={loading} failed={failed}/>
   </Space>
  )
}
