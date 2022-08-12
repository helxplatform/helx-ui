import React, { Fragment, useMemo, useCallback, useState } from 'react'
import { Spin, Grid as AntGrid, Typography, Radio, Tooltip } from 'antd'
import {
  DatabaseOutlined as ConceptViewIcon,
  BarChartOutlined as VariableViewIcon
} from '@ant-design/icons'
import { useHelxSearch, SearchLayout, ExpandedResultsLayout } from '../'
import { SearchForm } from '../form'
import { VariableSearchResults, ConceptSearchResults } from './'

import './results.css'

export const Results = () => {
  const { isLoadingVariableResults, isLoadingConcepts, error, layout } = useHelxSearch()
  const [conceptView, setConceptView] = useState(true)


  const handleDataDisplayChange = (event) => {
    console.log("toggled")
    setConceptView(event.target.value)
  }

  if (isLoadingConcepts || isLoadingVariableResults) {
    return <Spin style={{ display: 'block', margin: '4rem' }} />
  }


  if (layout === SearchLayout.EXPANDED_RESULT) return (
    <ExpandedResultsLayout/>
  )
  return (
    <Fragment>
      <SearchForm />

      { error && <span>{ error.message }</span> }

      <Tooltip title="Results Toggle" placement="top">
        <Radio.Group value={conceptView} onChange={handleDataDisplayChange}>
          <Radio.Button value={true}>Concepts</Radio.Button>
          <Radio.Button value={false}>Variables</Radio.Button>
        </Radio.Group>
      </Tooltip>
      <Fragment>
        {conceptView ? <ConceptSearchResults /> : <VariableSearchResults />}
      </Fragment>
    </Fragment>
  )
}
