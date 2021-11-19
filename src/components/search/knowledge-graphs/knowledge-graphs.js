import React, { Fragment, useEffect, useState } from 'react'
import { kgLink } from '../../../utils'
import { Link } from '../../link'
import './knowledge-graphs.css'

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
    <Fragment key={ `kg-${i}` }>
      <div className="source-label"><Link to={kgLink.get_curie_purl(interaction.source.id)}>{interaction.source.name}</Link></div>
      <div />
      <div className="target-label"><Link to={kgLink.get_curie_purl(interaction.target.id)}>{interaction.target.name}</Link></div>

      <div className="source-node"><span className="node" /></div>
      <div className="edge">
        <div className="edge-type">{interaction.type}</div>
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

export const KnowledgeGraphs = ({ graphs: complete_graphs }) => {
  if (complete_graphs.length) {
    const graphs = complete_graphs.map((graph) => graph.knowledge_graph);
    return (
      <div className="interactions-grid">
        <div className="column-title">Ontological Term)</div>
        <div className="column-title">Interaction Type</div>
        <div className="column-title">Linked Term</div>
        { graphs.map(graph => <KnowledgeGraph graph={graph} />)}
      </div>
    )
  }

  return <NoKnowledgeGraphsMessage />
}