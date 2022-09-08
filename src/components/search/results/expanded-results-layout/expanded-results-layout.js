import { Fragment, useEffect, useState } from 'react'
import { Divider, Grid, Spin } from 'antd'
import { SearchForm, useHelxSearch } from '../..'
import { ExpandedResultsSidebar } from './expanded-results-sidebar'
import { ExpandedResultsContent } from './expanded-results-content'
import { ResultsHeader } from '..'
import classNames from 'classnames'
import './expanded-results-layout.css'

const { useBreakpoint } = Grid

export const ExpandedResultsLayout = () => {
    const { selectedResult, setSelectedResult, concepts, totalConcepts, isLoadingConcepts, query } = useHelxSearch()
    const { md } = useBreakpoint()

    const [expanded, setExpanded] = useState(true)

    useEffect(() => {
        if (selectedResult !== null) {
            // If the result isn't null, it indicates a "redirect" to this layout with an active result already selected.
            setExpanded(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        // When a new search is executed, the layout should automatically be expanded to view the new results.
        setExpanded(true)
    }, [query])

    useEffect(() => {
        if (!md && selectedResult) {
            // Mobile display and a result was selected
            setExpanded(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedResult])

    const closeSelected = () => {
        setSelectedResult(null)
        setExpanded(true)
    }

    return (
        <div className={classNames("expanded-results-layout", !md && "mobile")}>
            <div className="expanded-results-upper-container">
                <div className="expanded-results-upper-container-top">
                    <SearchForm type={totalConcepts ? "minimal" : "full"} />
                </div>
                <ResultsHeader concepts={concepts} style={{ display: totalConcepts > 0 ? undefined : "none" }} />
            </div>
            {isLoadingConcepts && totalConcepts === 0 && (
                <Spin style={{ display: 'block', margin: '4rem', flexGrow: 1 }} />
            )}
            {totalConcepts > 0 && (
                <Fragment>
                    {/* { md && <Divider style={{ marginBottom: 0 }} /> } */}
                    <div className="expanded-results-lower-container">
                        <ExpandedResultsSidebar expanded={expanded} setExpanded={setExpanded} />
                        <Divider
                            type="vertical"
                            style={{
                                height: "auto",
                                marginLeft: "24px",
                                marginRight: "24px",
                                marginTop: "0",
                                marginBottom: "0",
                                // You can only see the sidebar or concepts view at one time on mobile
                                // so there's no need for a divider between the two.
                                display: !md ? "none" : undefined
                            }}
                        />
                        <ExpandedResultsContent expanded={expanded} closeSelected={closeSelected}/>
                    </div>
                    { md && <Divider style={{ margin: 0 }}/> }
                </Fragment>
            )}
        </div>
    )
}