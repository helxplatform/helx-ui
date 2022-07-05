import { Tag, Typography } from 'antd'
import Highlighter from 'react-highlight-words'
import { useHelxSearch } from '../../../../'

const { Text } = Typography

export const RelatedConceptTag = ({ concept, highlight }) => {
    const { doSearch } = useHelxSearch()
    
    return (
        <Tag style={{ margin: 0 }} onClick={() => {
            doSearch(concept.name)
        }}>
            <Text key={concept.name}>
                <Highlighter searchWords={highlight} textToHighlight={ concept.name } />
            </Text>
        </Tag>
    )
}