import React, { Fragment, useState, useMemo } from 'react'
import { Radio, notification, Spin, Tooltip, Typography, Grid as AntGrid, Empty } from 'antd'
import { PaginationTray, ConceptCard, ConceptModal, useHelxSearch, SearchLayout, ExpandedResultsLayout } from '../'
import './concept-results.css'
import { ResultsHeader } from '.'
import { SearchForm } from '../form'

const { Text } = Typography
const { useBreakpoint } = AntGrid

export const ConceptSearchResults = () => {
  const {
    query, concepts, perPage, currentPage,
    pageCount, isLoadingConcepts, error, setSelectedResult,
    layout
  } = useHelxSearch()
  const { md } = useBreakpoint();

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
      {isLoadingConcepts ? (
        <Spin style={{ display: 'block', margin: '4rem', flexGrow: 1 }} />
      ) : (
        <Fragment>
        { error && <span>{ error.message }</span> }

        {
          query && !error.message && (
            <Fragment>
            <div className="results" style={{ flexGrow: 1 }}>
              {concepts.length > 0 && <ResultsHeader />}
              <div className={gridClass}>
                {
                  concepts.map((result, i) => {
                    const index = (currentPage - 1) * perPage + i + 1
                    return (
                      <ConceptCard
                        key={ `${query}_result_${index}` }
                        index={ index }
                        result={ result }
                        openModalHandler={ () => setSelectedResult(result) }
                      />
                    )
                  })
                }
              </div>
            </div>
            <br/><br/>
            { pageCount > 1 && <PaginationTray /> }
            </Fragment>
          )
        }
        </Fragment>
      )}
    </Fragment>
  )
}
