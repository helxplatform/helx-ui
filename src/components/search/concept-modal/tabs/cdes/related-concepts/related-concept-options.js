import { Menu, Typography } from 'antd'
import { ExportOutlined, SearchOutlined } from '@ant-design/icons'
import { useAnalytics } from '../../../../../../contexts'

const { Text } = Typography

export const RelatedConceptOptions = ({ concept, openSearch, openConcept, setClosed }) => {
    const { analyticsEvents } = useAnalytics()
    return (
        <Menu
            mode="vertical"
            className="related-concept-options"
            selectedKeys={[]}
            onClick={setClosed}
            items={[
                {
                    key: 0,
                    label: (
                        <Text>Open</Text>
                    ),
                    icon: <ExportOutlined />,
                    onClick: () => {
                        analyticsEvents.cdeRelatedConceptOpened(concept.id)
                        openConcept()
                    },
                },
                {
                    key: 1,
                    label: (
                        <Text>Search</Text>
                    ),
                    icon: <SearchOutlined />,
                    onClick: () => {
                        analyticsEvents.cdeRelatedConceptSearched(concept.id)
                        openSearch()
                    }
                },
            ]}
        />
    )
}