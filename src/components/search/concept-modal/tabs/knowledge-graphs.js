import { useMemo, useState } from 'react'
import { Space, Typography } from 'antd'
import { KnowledgeGraphs } from '../../'
import { DebouncedInput } from '../../../'
import { useLunrSearch } from '../../../../hooks'

const { Title } = Typography

export const KnowledgeGraphsTab = ({ graphs, loading, error }) => {
  const [search, setSearch] = useState("")

  const docs = useMemo(() => {
    if (loading || error) return []
    return graphs.map(({ knowledge_graph }, i) => {
      const { nodes, edges } = knowledge_graph

      const edge = edges[0]
      const subject = nodes.find((node) => node.id === edge.subject)
      const object = nodes.find((node) => node.id === edge.object)
      return {
        id: i,
        predicate: edge.predicate_label,
        subjectName: subject.name,
        subjectSynonyms: subject.synonyms?.join(" "),
        objectName: object.name,
        objectSynonyms: object.synonyms?.join(" ")
      }
    })
  }, [graphs, loading, error])

  const lunrConfig = useMemo(() => ({
    docs,
    index: {
      ref: "id",
      fields: [
        "predicate",
        "subjectName",
        "objectName",
        /**
         * These fields are extra data (i.e. we have this data, but it is not shown to the user)
         * meaning that search hits generated from this data cannot be highlighted in the UI.
         * 
         */
        // "subjectSynonyms",
        // "objectSynonyms"
    ]
    }
  }), [docs])
  const { index, lexicalSearch } = useLunrSearch(lunrConfig)

  const [graphSource, highlightTokens] = useMemo(() => {
    if (loading || error) return [[], []]
    if (search.length < 3) return [graphs, []]

    const { hits, tokens } = lexicalSearch(search)
    const matchedGraphs = hits.map(({ ref: i }) => graphs[i])

    return [ matchedGraphs, tokens ]
  }, [graphs, loading, error, search, lexicalSearch])
  
  return (
    <Space direction="vertical">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <Title level={ 4 } style={{ margin: 0 }}>Knowledge Graphs</Title>
        { !loading && !error && <DebouncedInput setValue={setSearch}/> }
      </div>
      <KnowledgeGraphs graphs={ graphSource } loading={ loading } error={ error } highlight={ highlightTokens } />
    </Space>    
  )
}