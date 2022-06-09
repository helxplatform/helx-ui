import React, { Fragment, useState, useMemo, useEffect, useCallback } from 'react'
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
import { useIsScrollable } from '../../../hooks'

const { Text } = Typography
const { useBreakpoint } = AntGrid

export const ConceptSearchResults = () => {
  const {
    query, conceptPages, totalConcepts, perPage, currentPage, pageCount, typeFilter,
    isLoadingConcepts, error, layout, setLayout, setCurrentPage, setSelectedResult } = useHelxSearch()
  const { basePath } = useEnvironment()
  const { analyticsEvents } = useAnalytics()
  const { md } = useBreakpoint();
  // const [isScrollable, ref, node] = useIsScrollable([conceptPages], document.querySelector('#root'))

  const concepts = useMemo(() => Object.values(conceptPages).flat(), [conceptPages])
  const hasMore = useMemo(() => (
    // While typeFilter remains implemented client-side, on less frequent filters you can go 10+ pages without getting a single new concept.
    // For performance reasons, a user shouldn't be loading 10+ pages within a single second through the infinite scroll.
    !typeFilter && !isLoadingConcepts && (currentPage < pageCount || pageCount === 0)
  ), [typeFilter, isLoadingConcepts, currentPage, pageCount])
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

  const NotifyLinkCopied = useCallback(() => {
    notification.open({ key: 'key', message: 'Link copied to clipboard' })
    navigator.clipboard.writeText(window.location.href)
    analyticsEvents.searchURLCopied(query)
  }, [analyticsEvents])

  const handleChangeLayout = useCallback((event) => {
    const newLayout = event.target.value;
    setLayout(newLayout)
    // Only track when layout changes
    if (layout !== newLayout) {
      analyticsEvents.searchLayoutChanged(query, newLayout, layout)
    }
  }, [layout, analyticsEvents])

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
              next={getNextPage}
              hasMore={hasMore}
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
            {
              typeFilter ? (
                null
              ) : (
                (currentPage === 0 || currentPage < pageCount || isLoadingConcepts) && (
                  <Spin style={{ display: "block", margin: "32px" }} />
                )
              )
            }
          </div>
          </Fragment>
        )
      }
      </Fragment>
    </Fragment>
  )
}
