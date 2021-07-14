import React, { Fragment, useState, useMemo } from 'react'
import { Link } from '../../link'
import { Radio, notification, Spin, Tooltip, Typography } from 'antd'
import {
  LinkOutlined as LinkIcon,
  TableOutlined as GridViewIcon,
  UnorderedListOutlined as ListViewIcon,
} from '@ant-design/icons'
import { PaginationTray, SearchResultCard, SearchResultModal, useHelxSearch } from '../'
import './results.css'

const { Text } = Typography

const GRID = 'GRID'
const LIST = 'LIST'

export const SearchResults = () => {
  const { query, results, totalResults, perPage, currentPage, pageCount, isLoadingResults, error, setSelectedResult } = useHelxSearch()
  const [layout, setLayout] = useState(GRID)

  const NotifyLinkCopied = () => {
    notification.open({ key: 'key', message: 'Link copied to clipboard'})
    navigator.clipboard.writeText(window.location.href)
  }

  const handleChangeLayout = event => setLayout(event.target.value)

  const MemoizedResultsHeader = useMemo(() => (
    <div className="header">
      <Text>{ totalResults } results for "{ query }" ({ pageCount } page{ pageCount > 1 && 's' })</Text> 
      <Tooltip title="Shareable link" placement="top">
        <Link to={ `/helx/search?q=${ query }&p=${ currentPage }` } onClick={NotifyLinkCopied}><LinkIcon /></Link>
      </Tooltip>
      <Tooltip title="Toggle Layout" placement="top">
        <Radio.Group value={ layout } onChange={ handleChangeLayout }>
          <Radio.Button value={ GRID }><GridViewIcon /></Radio.Button>
          <Radio.Button value={ LIST }><ListViewIcon /></Radio.Button>
        </Radio.Group>
      </Tooltip>
    </div>
  ), [currentPage, layout, pageCount, totalResults, query])

  if (isLoadingResults) {
    return <Spin style={{ display: 'block', margin: '4rem' }} />
  }

  return (
    <Fragment>

      { error && <span>{ error.message }</span> }

      {
        query && !error.message && (
          <div className="results">
            { results.length >= 1 && MemoizedResultsHeader }

            <div className={ layout === GRID ? 'results-list grid' : 'results-list list' }>
              {
                results.map((result, i) => {
                  const index = (currentPage - 1) * perPage + i + 1
                  return (
                    <SearchResultCard
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
        )
      }

      <br/><br/>

      { pageCount > 1 && <PaginationTray /> }

    </Fragment>
  )
}
