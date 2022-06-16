import React, { Fragment, useMemo, useCallback } from 'react'
import { Spin, Grid as AntGrid, Typography } from 'antd'
import InfiniteScroll from 'react-infinite-scroll-component'
import { BackTop } from '../../layout'
import { ResultsHeader, SearchBreadcrumbs } from './'
import { ConceptCard, useHelxSearch, SearchLayout, ExpandedResultsLayout } from '../'
import { SearchForm } from '../form'
import './concept-results.css'

const { Text } = Typography
const { useBreakpoint } = AntGrid

export const ConceptSearchResults = () => {
  const {
    query, conceptPages, perPage, currentPage, pageCount,
    typeFilter, isLoadingConcepts, error, layout,
    setCurrentPage, setSelectedResult } = useHelxSearch()
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

  let gridClass = 'results-list'
  switch (layout) {
    case SearchLayout.GRID:
      gridClass += ' grid'
      break;
    case SearchLayout.LIST:
      gridClass += ' list'
      break;
    case SearchLayout.EXPANDED_RESULT:
      gridClass += ' expanded-result'
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
            <SearchBreadcrumbs />
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
              currentPage === pageCount ? (
                null
                // <Text style={{ textAlign: "center", marginTop: "24px" }}>No more results.</Text>
              ) : (
                typeFilter ? (
                  <Text style={{ textAlign: "center", marginTop: "24px" }}>Disable filters to load more results.</Text>
                ) : (
                  (currentPage === 0 || currentPage < pageCount || isLoadingConcepts) && (
                    <Spin style={{ display: "block", margin: "32px" }} />
                  )
                )
              )
            }
          </div>
          <BackTop />
          </Fragment>
        )
      }
      </Fragment>
    </Fragment>
  )
}
