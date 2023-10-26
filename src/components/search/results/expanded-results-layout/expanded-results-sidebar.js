import { useEffect, useRef, useMemo, useCallback } from 'react'
import { Grid, Space, Spin, Tooltip, Typography } from 'antd'
import { ArrowRightOutlined, LeftOutlined, RightOutlined, MoreOutlined } from '@ant-design/icons'
import InfiniteScroll from 'react-infinite-scroll-component'
import classNames from 'classnames'
import { ConceptCard, useHelxSearch } from "../.."
import { BackTop } from '../../../layout'
import "./expanded-results-sidebar.css"


const { Text, Link } = Typography
const { useBreakpoint } = Grid

const AnimatedDiv = ({ show, children, ...props }) => (
    <div {...props}>
        {children}
    </div>
)

export const ExpandedResultsSidebar = ({ expanded, setExpanded }) => {
    const {
        conceptPages, selectedResult, setSelectedResult,
        pageCount, isLoadingConcepts, setLayout,
        currentPage, setCurrentPage
    } = useHelxSearch()
    const { md } = useBreakpoint()
    const cardRefs = useRef({})
    // const [isScrollable, ref, node] = useIsScrollable([conceptPages])
    
    const concepts = useMemo(() => Object.values(conceptPages).flat(), [conceptPages])
    const hasMore = useMemo(() => (
        !isLoadingConcepts && (currentPage < pageCount || pageCount === 0)
    ), [isLoadingConcepts, currentPage, pageCount])

    const getNextPage = useCallback(() => {
        setCurrentPage(currentPage + 1)
    }, [currentPage])

    /*useEffect(() => {
        // If the search/filter results in results that don't fill the page entirely, then the infinite scroller
        // won't ever trigger to load new results. So manually check if the page isn't scrollable and load new results
        // until it is either scrollable or out of results.
        if (!node) return
        if (!isScrollable && hasMore) {
            getNextPage()
        }
    }, [node, isScrollable, hasMore])*/

    useEffect(() => {
        if (selectedResult !== null) {
            // If the result isn't null, it indicates a "redirect" to this layout with an active result already selected.
            // Also want to scroll to the corresponding card in the result list, so the user is still where they were
            // scrolled to in the previous layout.
            const selectedRef = cardRefs.current[selectedResult.id]
            window.requestAnimationFrame(() => {
                // Something going on within the InfiniteScroll component messes with scrolling dimensions,
                // so the document is not actually scroll-ready yet on mount.
                selectedRef.scrollIntoView()
            })
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
                            next={getNextPage}
                            hasMore={hasMore}
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
                                {
                                    currentPage === pageCount ? (
                                         null
                                    ) : ((currentPage === 0 || currentPage < pageCount || isLoadingConcepts) && (
                                            <Spin
                                                className={classNames("results-list-spin", concepts.length === 0 && isLoadingConcepts && "full-load")}
                                                style={{ display: "block", margin: "0 16px" }}
                                            />
                                        )
                                    )
                                }
                            </div>
                        </InfiniteScroll>
                        <BackTop
                            target={ () => document.querySelector("#expandedResultScroller") }
                            style={{
                                position: "absolute",
                                ...(md ? (
                                        expanded ? {
                                            top: "16px",
                                            left: "16px"
                                        } : {
                                            display: "none",
                                            bottom: "8px",
                                            right: "8px"
                                        }
                                    ) : {
                                        bottom: "8px",
                                        right: "8px"
                                    }
                                )
                            }}
                        />
                        
                    </div>
                </div>
            </div>
            {/* { expanded && pageCount > 1 && <div style={{ marginTop: "8px" }}><PaginationTray showTotal={false} /></div> } */}
        </Space>
    )
}