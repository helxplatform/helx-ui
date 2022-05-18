import { Fragment, useEffect, useState } from 'react'
import { Divider, Typography } from 'antd'
import { SearchForm, SearchLayout, useHelxSearch } from '../..'
import { ExpandedResultsSidebar } from './expanded-results-sidebar'
import './expanded-results-layout.css'
import { ExpandedResultsContent } from './expanded-results-content'
import { ResultsHeader } from '..'

const { Text, Paragraph, Title, Link } = Typography

export const ExpandedResultsLayout = () => {
    const { selectedResult, setSelectedResult, setLayout, concepts, totalConcepts } = useHelxSearch()

    const [expanded, setExpanded] = useState(true)
    const [doCloseFullscreen, setDoCloseFullscreen] = useState(null)

    // useEffect(() => {
    //     if (concepts.length > 0 && selectedResult === null) setSelectedResult(concepts[0])
    // }, [concepts])
    useEffect(() => {
        if (selectedResult !== null) {
            // Indicates a "redirect" to this layout with an active result already selected.
            setExpanded(false)
        }
    }, [])

    useEffect(() => {
        if (doCloseFullscreen) {
            setSelectedResult(doCloseFullscreen)
            setDoCloseFullscreen(null)
        }
    }, [doCloseFullscreen])

    const closeFullscreen = () => {
        setDoCloseFullscreen(selectedResult)
        setLayout(SearchLayout.DEFAULT)
    }

    const closeSelected = () => {
        setSelectedResult(null)
        setExpanded(true)
    }

    return (
        <div className="expanded-results-layout">
            <div className="expanded-results-upper-container">
                <SearchForm type={totalConcepts ? "minimal" : "full"} />
                <ResultsHeader style={{ display: concepts.length > 0 ? undefined : "none" }} />
            </div>
            {concepts.length > 0 && (
                <Fragment>
                    <Divider style={{ marginBottom: 0 }} />
                    <div className="expanded-results-lower-container">
                        <ExpandedResultsSidebar expanded={expanded} setExpanded={setExpanded} />
                        <Divider type="vertical" style={{ height: "auto", marginLeft: "24px", marginRight: "24px", marginTop: "-24px", marginBottom: "-24px" }} />
                        <ExpandedResultsContent closeSelected={closeSelected}/>
                    </div>
                    <Divider style={{ margin: 0 }}/>
                </Fragment>
            )}
        </div>
    )
}