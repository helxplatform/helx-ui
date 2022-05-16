import { notification, Radio, Tooltip, Typography } from "antd"
import {
    LinkOutlined as LinkIcon,
    TableOutlined as GridViewIcon,
    UnorderedListOutlined as ListViewIcon,
    LayoutOutlined as ExpandedResultIcon
} from '@ant-design/icons'
import { SearchLayout, useHelxSearch } from "../.."
import { useAnalytics, useEnvironment } from "../../../../contexts"

const { Text, Link } = Typography

export const ResultsHeader = () => {
    const {
        query, totalConcepts,
        currentPage, pageCount,
        layout, setLayout
    } = useHelxSearch()
    const { basePath } = useEnvironment()
    const { analyticsEvents } = useAnalytics()

    const NotifyLinkCopied = () => {
        notification.open({
            key: 'link-copied-key',
            message: 'Link copied to clipboard',
            description: <Text type="secondary">{window.location.href}</Text>
        })
        navigator.clipboard.writeText(window.location.href)
        analyticsEvents.searchURLCopied(query)
    }
    const handleChangeLayout = (event) => {
        const newLayout = event.target.value;
        setLayout(newLayout)
    }

    return (
        <div className="header">
            <Text>{totalConcepts} concepts ({pageCount} page{pageCount > 1 && 's'})</Text>
            <Tooltip title="Shareable link" placement="top">
                {/* Just want anchor styling */}
                <Link onClick={NotifyLinkCopied}><LinkIcon /></Link>
            </Tooltip>
            <Tooltip title="Toggle Layout" placement="top">
                <Radio.Group value={layout} onChange={handleChangeLayout}>
                <Radio.Button value={SearchLayout.GRID}><GridViewIcon /></Radio.Button>
                <Radio.Button value={SearchLayout.LIST}><ListViewIcon /></Radio.Button>
                <Radio.Button value={SearchLayout.EXPANDED_RESULT}><ExpandedResultIcon /></Radio.Button>
                </Radio.Group>
            </Tooltip>
        </div>
    )
}