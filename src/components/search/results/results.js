import React, { Fragment, useState, useMemo } from 'react'
import { Link } from '../../link'
import { Radio, notification, Spin, Tooltip, Typography, Collapse, List } from 'antd'
import {
  LinkOutlined as LinkIcon,
  TableOutlined as GridViewIcon,
  UnorderedListOutlined as ListViewIcon,
  DatabaseOutlined as ConceptViewIcon,
  SmallDashOutlined as VariableViewIcon
} from '@ant-design/icons'
import { PaginationTray, ConceptCard, useHelxSearch } from '../'
import './results.css'
import { useAnalytics, useEnvironment } from '../../../contexts'
import { VariableSearchResults } from './'

const { Text } = Typography

const GRID = 'GRID'
const LIST = 'LIST'

export const SearchResults = () => {
  const { query, concepts, totalConcepts, perPage, currentPage, pageCount, isLoadingConcepts, error, setSelectedResult, totalStudyResults, totalVariableResults, variableError, isLoadingVariableResults } = useHelxSearch()
  const { basePath } = useEnvironment()
  const analytics = useAnalytics()
  const [layout, setLayout] = useState(GRID)
  const [conceptView, setConceptView] = useState(true)

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

  const handleDataDisplayChange = (event) => {
    setConceptView(event.target.value)
  }

  const MemoizedResultsHeader = useMemo(() => (
    <div className="header">
      <Text>{totalConcepts} concepts and {totalStudyResults} studies with {totalVariableResults} variables for "{query}" ({pageCount} page{pageCount > 1 && 's'})</Text>
      <Tooltip title="Results Toggle" placement="top">
        <Radio.Group value={conceptView} onChange={handleDataDisplayChange}>
          <Radio.Button value={true}><ConceptViewIcon /></Radio.Button>
          <Radio.Button value={false}><VariableViewIcon /></Radio.Button>
        </Radio.Group>
      </Tooltip>
      <Tooltip title="Layout Toggle" placement="top">
        <Radio.Group value={layout} onChange={handleChangeLayout}>
          <Radio.Button value={GRID}><GridViewIcon /></Radio.Button>
          <Radio.Button value={LIST}><ListViewIcon /></Radio.Button>
        </Radio.Group>
      </Tooltip>
      <Tooltip title="Shareable link" placement="top">
        <Link to={`${basePath}search?q=${query}&p=${currentPage}`} onClick={NotifyLinkCopied}><LinkIcon /></Link>
      </Tooltip>
    </div>
  ), [currentPage, layout, pageCount, totalConcepts, query, totalStudyResults, totalVariableResults, conceptView])

  if (isLoadingConcepts) {
    return <Spin style={{ display: 'block', margin: '4rem' }} />
  }

  const ConceptsList = () => {
    return (
      concepts.map((result, i) => {
        const index = (currentPage - 1) * perPage + i + 1
        return (
          <ConceptCard
            key={`${query}_result_${index}`}
            index={index}
            result={result}
            openModalHandler={() => setSelectedResult(result)}
          />
        )
      })
    )
  }

  return (
    <Fragment>

      {error && <span>{error.message}</span>}

      {
        query && !error.message && (
          <div className="results">
            {concepts.length >= 1 && MemoizedResultsHeader}

            <div className={layout === GRID ? 'results-list grid' : 'results-list list'}>
              {conceptView ? <ConceptsList /> : <VariableSearchResults /> }
            </div>
          </div>
        )
      }

      <br /><br />

      {pageCount > 1 && conceptView ? <PaginationTray /> : <div />}
    </Fragment>
  )
}
