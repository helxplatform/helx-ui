import React, { Fragment, useState, useMemo, useEffect } from 'react'
import { Radio, notification, Spin, Tooltip, Typography, Grid as AntGrid, Select } from 'antd'
import {
  LinkOutlined as LinkIcon,
  TableOutlined as GridViewIcon,
  UnorderedListOutlined as ListViewIcon,
} from '@ant-design/icons'
import { PaginationTray, ConceptCard, useHelxSearch } from '../'
import './concept-results.css'
import { useAnalytics, useEnvironment } from '../../../contexts'
import { Link } from '../../link'

const { Text } = Typography
const { Option } = Select
const { useBreakpoint } = AntGrid

const GRID = 'GRID'
const LIST = 'LIST'

export const ConceptSearchResults = () => {
  const { query, concepts, totalConcepts, perPage, currentPage, pageCount, isLoadingConcepts, error, setSelectedResult } = useHelxSearch()
  const { basePath } = useEnvironment()
  const { analyticsEvents } = useAnalytics()
  const { md } = useBreakpoint();
  const [layout, setLayout] = useState(GRID)
  const [typeFilter, setTypeFilter] = useState(null)

  useEffect(() => {
    setTypeFilter(null)
  }, [query])

  let gridClass = (layout === GRID) ? 'results-list grid' : 'results-list list'
  gridClass += md ? " md" : ""

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

  const conceptTypes = useMemo(() => concepts.reduce((acc, cur) => {
    if (!acc.includes(cur.type)) acc.push(cur.type)
    return acc
  }, []), [concepts])
  const MemoizedResultsHeader = useMemo(() => (
    <div className="header">
      <Text>{totalConcepts} concepts ({pageCount} page{pageCount > 1 && 's'})</Text>
      <Tooltip title="Shareable link" placement="top">
        <Link to={`${basePath}search?q=${query}&p=${currentPage}`} onClick={NotifyLinkCopied}><LinkIcon /></Link>
      </Tooltip>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
        Filter type:
        <Select
          value={typeFilter}
          onChange={(value) => setTypeFilter(value)}
          placeholder="Filter type"
          dropdownMatchSelectWidth={false}
          placement="bottomRight"
          style={{ maxWidth: "125px" }}
        >
          <Option value={null}>All</Option>
          {
            conceptTypes.sort((a, b) => concepts.filter((x) => x.type === b).length - concepts.filter((x) => x.type === a).length).map((conceptType) => (
              <Option key={conceptType} value={conceptType}>{conceptType} ({concepts.filter((concept) => concept.type === conceptType).length})</Option>
            ))
          }
        </Select>
      </div>
      <Tooltip title="Toggle Layout" placement="top">
        <Radio.Group value={layout} onChange={handleChangeLayout}>
          <Radio.Button value={GRID}><GridViewIcon /></Radio.Button>
          <Radio.Button value={LIST}><ListViewIcon /></Radio.Button>
        </Radio.Group>
      </Tooltip>
    </div>
  ), [currentPage, layout, pageCount, totalConcepts, query, typeFilter, conceptTypes, basePath, concepts, handleChangeLayout])

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

            <div className={gridClass}>
              {
                concepts.filter((concept) => typeFilter === null || concept.type === typeFilter).map((result, i) => {
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
