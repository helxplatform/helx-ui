import { useState, useEffect, useMemo } from "react"
import { notification, Radio, Tooltip, Typography, Select } from "antd"
import {
    LinkOutlined as LinkIcon,
    TableOutlined as GridViewIcon,
    UnorderedListOutlined as ListViewIcon,
    LayoutOutlined as ExpandedResultIcon
} from '@ant-design/icons'
import { SearchLayout, useHelxSearch } from "../.."
import { useAnalytics, useEnvironment } from "../../../../contexts"
import { Fragment } from "react"

const { Text, Link } = Typography
const { Option } = Select

const MINIMAL = 'minimal'
const FULL = 'full'

export const ResultsHeader = ({ concepts, type=FULL, ...props }) => {
    const {
        query, totalConcepts,
        currentPage, pageCount,
        layout, setLayout
    } = useHelxSearch()
    const { basePath } = useEnvironment()
    const { analyticsEvents } = useAnalytics()

    const [typeFilter, setTypeFilter] = useState(null)
    
    const conceptTypes = useMemo(() => concepts.reduce((acc, cur) => {
        if (!acc.includes(cur.type)) acc.push(cur.type)
        return acc
      }, []), [concepts])

    useEffect(() => {
        setTypeFilter(null)
      }, [query])

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
        <div className="header" {...props}>
            {type === FULL && (
                <Fragment>
                <Text>
                    {totalConcepts} concepts ({pageCount} page{pageCount > 1 && 's'})
                </Text>
                <Tooltip title="Shareable link" placement="top">
                    {/* Just want anchor styling */}
                    <Link onClick={NotifyLinkCopied} style={{ marginLeft: '16px', marginRight: '16px' }}><LinkIcon /></Link>
                </Tooltip>
                </Fragment>
            )}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginRight: "8px" }}>
                Filter type:
                <Select
                    value={typeFilter}
                    onChange={(value) => setTypeFilter(value)}
                    placeholder="Filter type"
                    dropdownMatchSelectWidth={false}
                    placement="bottomRight"
                    style={{ maxWidth: "125px" }}
                >
                    <Option value={null}>All</Option>
                    {
                        conceptTypes.sort((a, b) => concepts.filter((x) => x.type === b).length - concepts.filter((x) => x.type === a).length).map((conceptType) => (
                        <Option key={conceptType} value={conceptType}>{conceptType} ({concepts.filter((concept) => concept.type === conceptType).length})</Option>
                        ))
                    }
                </Select>
            </div>
            <Tooltip title="Toggle Layout" placement="top">
                <Radio.Group value={layout} onChange={handleChangeLayout}>
                    <Radio.Button value={SearchLayout.GRID}><GridViewIcon /></Radio.Button>
                    <Radio.Button value={SearchLayout.EXPANDED_RESULT}><ExpandedResultIcon /></Radio.Button>
                    {/* <Radio.Button value={SearchLayout.LIST}><ListViewIcon /></Radio.Button> */}
                </Radio.Group>
            </Tooltip>
        </div>
    )
}