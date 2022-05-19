import { Fragment, useEffect, useRef } from 'react'
import { Grid, Space, Spin, Tooltip, Typography } from 'antd'
import { ArrowRightOutlined, LeftOutlined, RightOutlined, MoreOutlined } from '@ant-design/icons'
import { ResultsHeader } from '..'
import { ConceptCard, PaginationTray, SearchForm, useHelxSearch } from "../.."
import classNames from 'classnames'
import "./expanded-results-sidebar.css"


const { Title, Link } = Typography
const { useBreakpoint } = Grid 

export const ExpandedResultsSidebar = ({ expanded, setExpanded }) => {
    const {
        concepts, selectedResult, setSelectedResult,
        pageCount, isLoadingConcepts, setLayout
    } = useHelxSearch()
    const { md } = useBreakpoint()

    const cardRefs = useRef({})

    useEffect(() => {
        if (selectedResult !== null) {
            // If the result isn't null, it indicates a "redirect" to this layout with an active result already selected.
            // Also want to scroll to the corresponding card in the result list, so the user is still where they were
            // scrolled to in the previous layout.
            const selectedRef = cardRefs.current[selectedResult.id]
            selectedRef.scrollIntoView()
        }
    }, [])

    return (
        <Space
            direction="vertical"
            className={classNames("results results-sidebar", expanded ? "expanded" : "minimized", !md && "mobile")}
        >
            <div className="results-upper-side-container">
                <Tooltip title={expanded ? "Close search results" : "Open search results"} placement="right">
                    <Link className="collapse-results" type="secondary" onClick={ () => setExpanded(!expanded) }>
                        {
                            expanded ? (
                                <LeftOutlined style={{ fontSize: "16px" }} />
                                ) : (
                                <RightOutlined style={{ fontSize: "16px" }}/>
                            )
                        }
                    </Link>
                </Tooltip>
                <div className="results-list-container">
                    <Spin spinning={isLoadingConcepts}>
                        <div className="results-list grid" style={{ whiteSpace: "normal", maxWidth: md ? "500px" : undefined }}>
                            {
                                concepts.map((result, i) => (
                                    <ConceptCard
                                        key={result.id}
                                        className={classNames("expanded-result-option-concept-card", result.id === selectedResult?.id && "selected")}
                                        result={result}
                                        icon={result.id === selectedResult?.id ? null : ArrowRightOutlined}
                                        openModalHandler={ () => setSelectedResult(result) }
                                        ref={(ref) => cardRefs.current[result.id] = ref}
                                    />
                                ))
                            }
                        </div>
                    </Spin>
                </div>
            </div>
            { expanded && pageCount > 1 && <div style={{ marginTop: "8px" }}><PaginationTray showTotal={false} /></div> }
        </Space>
    )
}