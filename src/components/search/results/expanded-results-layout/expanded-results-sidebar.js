import { Fragment, useEffect, useRef, useMemo } from 'react'
import { Grid, Space, Spin, Tooltip, Typography } from 'antd'
import { ArrowRightOutlined, LeftOutlined, RightOutlined, MoreOutlined } from '@ant-design/icons'
import InfiniteScroll from 'react-infinite-scroll-component'
import { ResultsHeader } from '..'
import { ConceptCard, PaginationTray, SearchForm, useHelxSearch } from "../.."
import classNames from 'classnames'
import "./expanded-results-sidebar.css"


const { Title, Link } = Typography
const { useBreakpoint } = Grid 

export const ExpandedResultsSidebar = ({ expanded, setExpanded }) => {
    const {
        conceptPages, selectedResult, setSelectedResult,
        pageCount, isLoadingConcepts, setLayout,
        currentPage, setCurrentPage
    } = useHelxSearch()
    const { md } = useBreakpoint()

    const cardRefs = useRef({})
    
    const concepts = useMemo(() => Object.values(conceptPages).flat(), [conceptPages])

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
                    <div className="results-list-scroll" id="expandedResultScroller">
                        <InfiniteScroll
                            scrollableTarget={"expandedResultScroller"}
                            dataLength={concepts.length}
                            next={() => {console.log(currentPage + 1);setCurrentPage(currentPage + 1)}}
                            hasMore={!isLoadingConcepts && (currentPage < pageCount || pageCount === 0)}
                        >
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
                        </InfiniteScroll>
                        {(currentPage === 0 || currentPage < pageCount || isLoadingConcepts) && (
                            <Spin style={{ display: "block", marginTop: "32px", marginBottom: "0" }} />
                        )}
                    </div>
                </div>
            </div>
            {/* { expanded && pageCount > 1 && <div style={{ marginTop: "8px" }}><PaginationTray showTotal={false} /></div> } */}
        </Space>
    )
}