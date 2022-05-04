import React, { Fragment, useEffect, useState } from 'react'
import { Typography } from 'antd'
import { useHelxSearch } from '..'
import { kgLink } from '../../../utils'
import './knowledge-graphs.css'
import { Link } from '../../link'

const { Text } = Typography

const KnowledgeGraph = ({ graph }) => {
  const { addBreadcrumbFromKG, selectedResult } = useHelxSearch()
  const [interactions, setInteractions] = useState([])

  const { knowledge_graph: knowledgeGraph, question_graph: questionGraph } = graph

  useEffect(() => {
    if (knowledgeGraph) {
      knowledgeGraph.nodes.forEach(sourceNode => {
        const outgoingEdge = knowledgeGraph.edges.find(edge => edge.source_id === sourceNode.id)
        if (outgoingEdge) {
          const targetNode = knowledgeGraph.nodes.find(node => node.id === outgoingEdge.target_id)
          let newInteraction = { source: { name: sourceNode.name, id: sourceNode.id }, type: outgoingEdge.type, target: { name: targetNode.name, id: targetNode.id }, publications: outgoingEdge.publications }
          setInteractions(interactions => [...interactions, newInteraction])
        }
      })
    }
  }, [knowledgeGraph])

  const BreadcrumbLink = ({ node, divProps={}, aProps={}}) => {
    return (
      <div {...divProps}>
        { node.id === selectedResult.id ? (
          <Text type="secondary">{node.name}</Text>
        ) : (
          <a
            role="button"
            onClick={() => addBreadcrumbFromKG(node)}
            {...aProps}
          >
            {node.name}
          </a>
        )}
      </div>
    )
  }

  return interactions.map((interaction, i) => (
    <Fragment key={ `kg-${i}` }>
      <BreadcrumbLink node={interaction.source} divProps={{ className: "source-label" }}/>
      <div />
      <BreadcrumbLink node={interaction.target} divProps={{ className: "target-label" }}/>
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
    // const graphs = complete_graphs.map((graph) => graph.knowledge_graph);
    return (
      <div className="interactions-grid">
        <div className="column-title">Ontological Term)</div>
        <div className="column-title">Interaction Type</div>
        <div className="column-title">Linked Term</div>
        { complete_graphs.map(graph => <KnowledgeGraph graph={graph} />)}
      </div>
    )
  }

  return <NoKnowledgeGraphsMessage />
}