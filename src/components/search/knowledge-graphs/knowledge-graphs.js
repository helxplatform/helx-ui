import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { Result, Spin } from 'antd'
import _Highlighter from 'react-highlight-words'
import { kgLink } from '../../../utils'
import { Link } from '../../link'
import './knowledge-graphs.css'

const KnowledgeGraph = ({ graph, highlight }) => {
  const [interactions, setInteractions] = useState([])

  useEffect(() => {
    if (graph) {
      graph.nodes.forEach(sourceNode => {
        const outgoingEdge = graph.edges.find(edge => edge.source_id === sourceNode.id)
        if (outgoingEdge) {
          const targetNode = graph.nodes.find(node => node.id === outgoingEdge.target_id)
          let newInteraction = { source: { name: sourceNode.name, id: sourceNode.id }, type: outgoingEdge.type, target: { name: targetNode.name, id: targetNode.id }, publications: outgoingEdge.publications }
          setInteractions(interactions => [...interactions, newInteraction])
        }
      })
    }
  }, [graph])

  const Highlighter = useCallback(({ ...props }) => (
    <_Highlighter autoEscape={ true } searchWords={highlight} {...props}/>
), [highlight])

  return interactions.map((interaction, i) => (
    <Fragment key={ `kg-${i}` }>
      <div className="source-label">
        <Link to={kgLink.get_curie_purl(interaction.source.id)}>
          <Highlighter textToHighlight={ interaction.source.name } />
        </Link>
      </div>
      <div />
      <div className="target-label">
        <Link to={kgLink.get_curie_purl(interaction.target.id)}>
          <Highlighter textToHighlight={ interaction.target.name } />
        </Link>
      </div>

      <div className="source-node"><span className="node" /></div>
      <div className="edge">
        <div className="edge-type">
          <Highlighter textToHighlight={ interaction.type } />
        </div>
        <div className="edge-references">
          {
            interaction.publications.map((publication, i) => (
              <Fragment key={`${interaction.source}-pub-${i + 1}`}>
                [<Link to={ `https://pubmed.ncbi.nlm.nih.gov/${ publication.replace(/^PMID:/, '') }`}>{i + 1}</Link>]
              </Fragment>
            ))
          }
        </div>
      </div>
      <div className="target-node"><span className="node" /></div>
    </Fragment>
  ))
}

const NoKnowledgeGraphsMessage = () => {
  return (
    <div>No Graphs Found</div>
  )
}

export const KnowledgeGraphs = ({ graphs: complete_graphs, loading, error, highlight }) => {
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Spin />
    </div>
  )
  else if (error) return (
    <Result status="error" title="Oops!" subTitle="We&apos;re having trouble loading knowledge graphs right now. Please try again later..." />
  )
  else if (complete_graphs.length) {
    const graphs = complete_graphs.map((graph) => graph.knowledge_graph);
    return (
      <div className="interactions-grid">
        <div className="column-title">Ontological Term</div>
        <div className="column-title">Interaction Type</div>
        <div className="column-title">Linked Term</div>
        { graphs.map((graph) => {
          const { nodes, edges } = graph

          const edge = edges[0]
          const subject = nodes.find((node) => node.id === edge.subject)
          const object = nodes.find((node) => node.id === edge.object)

          const key = `${subject.id}-[${edge.predicate}]->${object.id}`
          
          return  (
            <KnowledgeGraph key={key} graph={graph} highlight={ highlight } />
          )
        })}
      </div>
    )
  }
  else return <NoKnowledgeGraphsMessage />
}