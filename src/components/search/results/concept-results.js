import React, { Fragment, useState, useMemo } from 'react'
import { Link } from '../../link'
import { Radio, notification, Spin, Tooltip, Typography } from 'antd'
import {
  LinkOutlined as LinkIcon,
  TableOutlined as GridViewIcon,
  UnorderedListOutlined as ListViewIcon,
} from '@ant-design/icons'
import { PaginationTray, ConceptCard, ConceptModal, useHelxSearch } from '../'
import './concept-results.css'
import { useAnalytics, useEnvironment } from '../../../contexts'

const { Text } = Typography

const GRID = 'GRID'
const LIST = 'LIST'

export const ConceptSearchResults = () => {
  const { query, concepts, totalConcepts, perPage, currentPage, pageCount, isLoadingConcepts, error, setSelectedResult } = useHelxSearch()
  const { basePath } = useEnvironment()
  const analytics = useAnalytics()
  const [layout, setLayout] = useState(GRID)

  const NotifyLinkCopied = () => {
    notification.open({ key: 'key', message: 'Link copied to clipboard' })
    navigator.clipboard.writeText(window.location.href)
    analytics.trackEvent({
      category: "UI Interaction",
      action: "Search URL copied",
      label: "User copied sharable link for search query",
      customParameters: {
        "Search term": query
      }
    })
  }

  const handleChangeLayout = (event) => {
    const newLayout = event.target.value;
    setLayout(newLayout)
    // Only track when layout changes
    if (layout !== newLayout) {
      analytics.trackEvent({
        category: "UI Interaction",
        action: "Search layout changed",
        label: `Layout set to "${newLayout}"`,
        customParameters: {
          "Search term": query,
          "Changed from": layout,
          "Changed to": newLayout
        }
      })
    }
  }

  const MemoizedResultsHeader = useMemo(() => (
    <div className="header">
      <Text>{totalConcepts} concepts ({pageCount} page{pageCount > 1 && 's'})</Text>
      <Tooltip title="Shareable link" placement="top">
        <Link to={`${basePath}search?q=${query}&p=${currentPage}`} onClick={NotifyLinkCopied}><LinkIcon /></Link>
      </Tooltip>
      <Tooltip title="Toggle Layout" placement="top">
        <Radio.Group value={layout} onChange={handleChangeLayout}>
          <Radio.Button value={GRID}><GridViewIcon /></Radio.Button>
          <Radio.Button value={LIST}><ListViewIcon /></Radio.Button>
        </Radio.Group>
      </Tooltip>
    </div>
  ), [currentPage, layout, pageCount, totalConcepts, query])

  if (isLoadingConcepts) {
    return <Spin style={{ display: 'block', margin: '4rem' }} />
  }

  return (
    <Fragment>

      { error && <span>{ error.message }</span> }

      {
        query && !error.message && (
          <div className="results">
            { concepts.length >= 1 && MemoizedResultsHeader }

            <div className={ layout === GRID ? 'results-list grid' : 'results-list list' }>
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
        )
      }

      <br/><br/>

      { pageCount > 1 && <PaginationTray /> }

    </Fragment>
  )
}
