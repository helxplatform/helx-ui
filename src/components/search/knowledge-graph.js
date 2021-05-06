import React, { Fragment, useEffect, useState } from 'react'
import { kgLink } from '../../utils'
import styled from 'styled-components'
import { ExternalLink } from '../link'

const InteractionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    row-gap: 1rem;
    width: 100%;
    margin: 1rem 0;
    text-align: center;
    & .column-title {
        text-align: center;
        font-weight: bold;
    }
`

const Node = styled.span`
    position: relative;
    display: block;
    margin: 0 auto;
    background-color: var(--color-crimson);
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 1rem solid #ddd;
    box-sizing: content-box;
    z-index: 2;
`

const Edge = styled.span`
    position: relative;
    border-bottom: 1px dashed var(--color-crimson);
    display: block;
    height: 1.75rem;
    margin: 0;
    width: 200%;
    transform: translate(-25%, 1rem);
    z-index: 1;
`

const PublicationLink = styled.a.attrs(props => (
    { target: '_blank', rel: 'noopener noreferrer', href: `https://pubmed.ncbi.nlm.nih.gov/${ props.pmid }`
}))`
    margin: 0 0.1rem;
    &::before { content: "["; }
    &::after { content: "]"; }
`


const KnowledgeGraph = ({ graph }) => {
    const [interactions, setInteractions] = useState([])
    
    useEffect(() => {
        if (graph) {
            graph.nodes.forEach(sourceNode => {
                const outgoingEdge = graph.edges.find(edge => edge.source_id === sourceNode.id)
                if (outgoingEdge) {
                    const targetNode = graph.nodes.find(node => node.id === outgoingEdge.target_id)
                    let newInteraction = { source: { name: sourceNode.name, id: sourceNode.id }, type: outgoingEdge.type, target: { name: targetNode.name, id: targetNode.id }, publications: outgoingEdge.publications }
                    setInteractions(interactions => [ ...interactions, newInteraction])
                }
            })
        }
    }, [graph])

    return interactions.map((interaction, i) => (
        <Fragment key={ i }>
            <div className="source-label"><ExternalLink to={kgLink.get_curie_purl(interaction.source.id)}>{interaction.source.name }</ExternalLink></div>
            <div />
            <div className="target-label"><ExternalLink to={kgLink.get_curie_purl(interaction.target.id)}>{interaction.target.name}</ExternalLink></div>
            <div className="source-node"><br/><Node /></div>
            <div className="type-edge">
                <Edge>
                { interaction.type }
                &nbsp;
                { interaction.publications.map((publication, i) => <PublicationLink key={ `${ interaction.source }-pub-${ i + 1 }` } pmid={ publication.replace(/^PMID:/, '') }>{ i + 1 }</PublicationLink>) }
                </Edge>
            </div>
            <div className="target"><br/><Node /></div>
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
            <InteractionsGrid>
                <div className="column-title">Ontological Term (ID)</div>
                <div className="column-title">Interaction Type [publication link(s)]</div>
                <div className="column-title">Linked Term (ID)</div>
                { graphs.map(graph => <KnowledgeGraph graph={ graph } />) }
            </InteractionsGrid>
        )
    }
    
    return <NoKnowledgeGraphsMessage />
}