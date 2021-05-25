import React, { Fragment, useEffect, useState } from 'react'
import { kgLink } from '../../utils'
import { Link } from '../link'
import './search.css'

const KnowledgeGraph = ({ graph }) => {
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

  return interactions.map((interaction, i) => (
    <Fragment key={i}>
      <div className="source-label"><Link to={kgLink.get_curie_purl(interaction.source.id)}>{interaction.source.name}</Link></div>
      <div />
      <div className="target-label"><Link to={kgLink.get_curie_purl(interaction.target.id)}>{interaction.target.name}</Link></div>
      <div className="source-node"><br /><span className="node" /></div>
      <div className="type-edge">
        <span className="edge">
          {interaction.type}
          &nbsp;
          {
            interaction.publications.map((publication, i) => (
              <Fragment>
                [<Link key={`${interaction.source}-pub-${i + 1}`} pmid={publication.replace(/^PMID:/, '')}>{i + 1}</Link>]
              </Fragment>
            ))
          }
        </span>
      </div>
      <div className="target"><br /><span className="node" /></div>
    </Fragment>
  ))
}

const NoKnowledgeGraphsMessage = () => {
  return (
    <div>No Graphs Found</div>
  )
}

export const KnowledgeGraphs = ({ graphs }) => {
  if (graphs.length) {
    return (
      <div className="interactions-grid">
        <div className="column-title">Ontological Term (ID)</div>
        <div className="column-title">Interaction Type [publication link(s)]</div>
        <div className="column-title">Linked Term (ID)</div>
        { graphs.map(graph => <KnowledgeGraph graph={graph} />)}
      </div>
    )
  }

  return <NoKnowledgeGraphsMessage />
}