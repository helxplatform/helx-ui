import React, { Fragment, useEffect, useState, useMemo } from 'react'
import { useAuth } from '../../contexts'
import { PaginationTray, SearchResult, useHelxSearch } from './'
import { SearchResultCard } from './result-card'
import { Button, notification, Pagination, Space, Spin, Tooltip, Typography } from 'antd'
import { Link } from '../link'
import {
  DownOutlined as DownIcon, 
  LinkOutlined as LinkIcon,
  // TableOutlined as GridViewIcon,
  // UnorderedListOutlined as ListViewIcon,
} from '@ant-design/icons'

const { Paragraph } = Typography

export const SearchResults = () => {
  const auth = useAuth()
  const [currentResults, setCurrentResults] = useState([]);
  const { query, results, totalResults, perPage, currentPage, pageCount, isLoadingResults, resultsSelected, clearSelect, error, selectedView, setSelectedView } = useHelxSearch()

  useEffect(() => {
    if (selectedView) {
      setCurrentResults(Array.from(resultsSelected.values()));
    }
    else {
      setCurrentResults(results);
    }
  }, [results, selectedView])

  const MemoizedResultsSummary = useMemo(() => {
    if (!results) return null
    return (
      <Paragraph>
        { totalResults } results for "{ query }" ({ pageCount } page{ pageCount > 1 && 's' })
      </Paragraph>
    )
  }, [query, pageCount, results, totalResults])

  const ShowShareableLink = () => {
    notification.open({ key: 'key', message: 'Link copied to clipboard'});
    // navigator.clipboard.writeText(window.location.href)
  }

  const MemoizedHeader = useMemo(() => (
    <div className="header">
      <div>
        Results { (currentPage - 1) * perPage + 1 } to { (currentPage - 1) * perPage + totalResults } of { totalResults } total results
        &nbsp;&nbsp;&nbsp;&nbsp;
      </div>
      <div className="results-actions">
        <Tooltip title="Shareable link" placement="top">
          <Link to={ `/search?q=${ query }&p=${ currentPage }` } onClick={ShowShareableLink}><LinkIcon /></Link>
        </Tooltip>
      </div>
    </div>
  ), [auth, query, currentPage, perPage, totalResults])

  return (
    <Fragment>

      { isLoadingResults && <Spin /> }

      { !isLoadingResults && error && <span>{ error.message }</span> }

      {
        query && !isLoadingResults && !error.message && (
          <div className="results">
            { results.length >= 1 && MemoizedResultsSummary }

            { results.length === 0 && <div>Your search <b>{query}</b> did not match any documents.</div> }
            
            <div className="grid">
              {
                currentResults.map((result, i) => {
                  const index = (currentPage - 1) * perPage + i + 1
                  return <SearchResultCard key={ `result-${ index }` } index={ index } result={ result } />
                })
              }
            </div>
          </div>
        )
      }

      <br/><br/>

      <PaginationTray />

    </Fragment>
  )
}
