import { notification, Radio, Tooltip, Typography, Select, Grid } from "antd"
import {
    LinkOutlined as LinkIcon,
    TableOutlined as GridViewIcon,
    LayoutOutlined as ExpandedResultIcon,
    BarChartOutlined as VariableViewIcon
} from '@ant-design/icons'
import { SearchLayout, useHelxSearch } from "../../"
import { useAnalytics } from "../../../../contexts"
import { Fragment } from "react"

const { Text, Link } = Typography
const { Option } = Select
const { useBreakpoint } = Grid

const MINIMAL = 'minimal'
const FULL = 'full'

export const ResultsHeader = ({ variables=false, type=FULL, ...props }) => {
    const {
        query, 
        totalConcepts, variableStudyResultCount, totalVariableResults,
        currentPage, pageCount,
        layout, setLayout,
        typeFilter, setTypeFilter,
        conceptTypeCounts, conceptPages
    } = useHelxSearch()
    const { analyticsEvents } = useAnalytics()
    const { md } = useBreakpoint()

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
        <div className="results-header" {...props}>
            {type === FULL && (
                <Fragment>
                <Text>
                    { variables ? (
                        `${ variableStudyResultCount } studies and ${ totalVariableResults } variables`
                    ) : (
                        `${ totalConcepts } concepts (${ Object.keys(conceptPages).length } of ${ pageCount } pages)`
                    ) }
                </Text>
                { !variables && (
                    <Tooltip title="Shareable link" placement="top">
                        {/* Just want anchor styling */}
                        <Link onClick={NotifyLinkCopied} style={{ marginLeft: '16px', marginRight: '16px' }}><LinkIcon /></Link>
                    </Tooltip>
                ) }
                </Fragment>
            )}
            <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    marginRight: "8px"
                }}
            >
                { variables ? (
                    null
                ) : (
                    <Fragment>
                        <Text style={{ display: !md ? "none" : undefined }}>Filter type:</Text>
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
                                Object.entries(conceptTypeCounts).sort((a, b) => b[1] - a[1]).map(([conceptType, count]) => (
                                <Option key={conceptType} value={conceptType}>{conceptType} ({count})</Option>
                                ))
                            }
                        </Select>
                    </Fragment>
                ) }
            </div>
            <Tooltip title="Toggle Layout" placement="top">
                <Radio.Group value={layout} onChange={handleChangeLayout}>
                    <Radio.Button value={SearchLayout.GRID}><GridViewIcon /></Radio.Button>
                    <Radio.Button value={SearchLayout.EXPANDED_RESULT}><ExpandedResultIcon /></Radio.Button>
                    <Radio.Button value={SearchLayout.VARIABLE_VIEW}><VariableViewIcon /></Radio.Button>
                </Radio.Group>
            </Tooltip>
        </div>
    )
}