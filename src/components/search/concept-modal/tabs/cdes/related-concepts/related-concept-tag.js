import { useState } from 'react'
import { Popover, Tag, Typography } from 'antd'
import Highlighter from 'react-highlight-words'
import { useHelxSearch } from '../../../../'
import { RelatedConceptOptions } from './related-concept-options'
import './related-concept-tag.css'

const { Text } = Typography

export const RelatedConceptTag = ({ concept, highlight }) => {
    const { doSearch } = useHelxSearch()
    const [showOptions, setShowOptions] = useState(false)
    
    return (
        <Popover
            placement="right"
            trigger="click"
            overlayClassName="related-concept-popover-overlay"
            title={`${concept.name}`}
            content={
                <RelatedConceptOptions
                    concept={concept}
                    openSearch={() => {}}
                    openConcept={() => {}}
                    setClosed={ () => setShowOptions(false) }
                />
            }
            visible={showOptions}
            onVisibleChange={(visible) => setShowOptions(visible)}
        >
            <Tag className="related-concept-tag" onClick={() => {
                // doSearch(concept.name)
                setShowOptions(true)
            }}>
                <Text key={concept.name}>
                    <Highlighter searchWords={highlight} textToHighlight={ concept.name } />
                </Text>
            </Tag>
        </Popover>
    )
}