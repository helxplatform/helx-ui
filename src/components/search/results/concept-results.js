import React, { Fragment, useState, useMemo, useEffect } from 'react'
import { Radio, notification, Spin, Tooltip, Typography, Grid as AntGrid, Select, Divider } from 'antd'
import {
  LinkOutlined as LinkIcon,
  TableOutlined as GridViewIcon,
  UnorderedListOutlined as ListViewIcon,
} from '@ant-design/icons'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useAnalytics, useEnvironment } from '../../../contexts'
import { Link } from '../../link'
import { ResultsHeader } from './'
import { PaginationTray, ConceptCard, useHelxSearch, SearchLayout, ExpandedResultsLayout } from '../'
import { SearchForm } from '../form'
import './concept-results.css'

const { useBreakpoint } = AntGrid

export const ConceptSearchResults = () => {
  const {
    query, conceptPages, totalConcepts, perPage, currentPage, pageCount,
    isLoadingConcepts, error, layout, setLayout, setCurrentPage, setSelectedResult } = useHelxSearch()
  const { basePath } = useEnvironment()
  const { analyticsEvents } = useAnalytics()
  const { md } = useBreakpoint();

  const concepts = useMemo(() => Object.values(conceptPages).flat(), [conceptPages])

  const NotifyLinkCopied = () => {
    notification.open({ key: 'key', message: 'Link copied to clipboard' })
    navigator.clipboard.writeText(window.location.href)
    analyticsEvents.searchURLCopied(query)
  }

  const handleChangeLayout = (event) => {
    const newLayout = event.target.value;
    setLayout(newLayout)
    // Only track when layout changes
    if (layout !== newLayout) {
      analyticsEvents.searchLayoutChanged(query, newLayout, layout)
    }
  }

  let gridClass = 'results-list'
  switch (layout) {
    case SearchLayout.GRID:
      gridClass += ' ' + 'grid'
      break;
    case SearchLayout.LIST:
      gridClass += ' ' + 'list'
      break;
    case SearchLayout.EXPANDED_RESULT:
      gridClass += ' ' + 'expanded-result'
      break;
  }
  gridClass += md ? " md" : ""

  if (layout === SearchLayout.EXPANDED_RESULT) return (
    <ExpandedResultsLayout/>
  )
  return (
    <Fragment>
      <SearchForm />
      <Fragment>
      { error && <span>{ error.message }</span> }

      {
        query && !error.message && (
          <Fragment>
          <div className="results" style={{ flexGrow: 1 }}>
            {concepts.length > 0 && <ResultsHeader concepts={concepts}/>}
            <InfiniteScroll
              dataLength={concepts.length}
              next={() => setCurrentPage(currentPage + 1)}
              hasMore={!isLoadingConcepts && (currentPage < pageCount || pageCount === 0)}
            >
              <div className={gridClass}>
                {
                  concepts.map((result, i) => {
                    const index = (currentPage - 1) * perPage + i + 1
                    return (
                      <ConceptCard
                        key={ result.id }
                        index={ index }
                        result={ result }
                        openModalHandler={ () => setSelectedResult(result) }
                      />
                    )
                  })
                }
              </div>
            </InfiniteScroll>
            {(currentPage === 0 || currentPage < pageCount || isLoadingConcepts) && (
              <Spin style={{ display: "block", margin: "32px" }} />
            )}
          </div>
          </Fragment>
        )
      }
      </Fragment>
    </Fragment>
  )
}
