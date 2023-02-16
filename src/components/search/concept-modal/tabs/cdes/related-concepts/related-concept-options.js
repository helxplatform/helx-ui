import { Menu, Typography } from 'antd'
import { ExportOutlined, SearchOutlined } from '@ant-design/icons'

const { Text } = Typography

export const RelatedConceptOptions = ({ concept, openSearch, openConcept, setClosed }) => {
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
                    onClick: openConcept,
                },
                {
                    key: 1,
                    label: (
                        <Text>Search</Text>
                    ),
                    icon: <SearchOutlined />,
                    onClick: openSearch
                },
            ]}
        />
    )
}