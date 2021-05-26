import React, { Fragment, useState, useMemo } from 'react'
import { notification, Spin, Tooltip, Typography } from 'antd'
import { PaginationTray, SearchResultCard, SearchResultModal, useHelxSearch } from './'
import { Link } from '../link'
import {
  LinkOutlined as LinkIcon,
  // TableOutlined as GridViewIcon,
  // UnorderedListOutlined as ListViewIcon,
} from '@ant-design/icons'
import './results.css'

const { Text } = Typography

export const SearchResults = () => {
  const { query, results, totalResults, perPage, currentPage, pageCount, isLoadingResults, error } = useHelxSearch()
  const [modalResult, setModalResult] = useState(null)

  const modalVisibility = useMemo(() => modalResult !== null, [modalResult])
  const handleCloseModal = () => setModalResult(null)
  const handleOpenModal = result => event => setModalResult(result)

  const NotifyLinkCopied = () => {
    notification.open({ key: 'key', message: 'Link copied to clipboard'})
    navigator.clipboard.writeText(window.location.href)
  }

  const MemoizedResultsHeader = useMemo(() => (
    <div className="header">
      <Text>{ totalResults } results for "{ query }" ({ pageCount } page{ pageCount > 1 && 's' })</Text>
      <Tooltip title="Shareable link" placement="left">
        <Link to={ `/search?q=${ query }&p=${ currentPage }` } onClick={NotifyLinkCopied}><LinkIcon /></Link>
      </Tooltip>
    </div>
  ), [currentPage, pageCount, totalResults, query])

  return (
    <Fragment>

      { isLoadingResults && <Spin /> }

      { !isLoadingResults && error && <span>{ error.message }</span> }

      {
        query && !isLoadingResults && !error.message && (
          <div className="results">
            { results.length >= 1 && MemoizedResultsHeader }

            { results.length === 0 && <div>Your search <b>{query}</b> did not match any documents.</div> }
            
            <div className="grid">
              {
                results.map((result, i) => {
                  const index = (currentPage - 1) * perPage + i + 1
                  return (
                    <SearchResultCard
                      key={`${query}_result_${index}`}
                      index={index}
                      result={result}
                      openModalHandler={handleOpenModal(result)}
                    />
                  )
                })
              }
            </div>
          </div>
        )
      }

      <br/><br/>

      <PaginationTray />

      <SearchResultModal
        result={modalResult}
        visible={modalVisibility}
        closeHandler={handleCloseModal}
      />

    </Fragment>
  )
}
