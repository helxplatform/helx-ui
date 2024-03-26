import React, { Fragment, useMemo, useCallback, useState } from 'react'
import { Spin, Grid as AntGrid, Typography, Radio, Tooltip } from 'antd'
import {
  DatabaseOutlined as ConceptViewIcon,
  BarChartOutlined as VariableViewIcon
} from '@ant-design/icons'
import { ExpandedResultsLayout, ConceptsGridLayout, VariableViewLayout } from './'
import { useHelxSearch, SearchLayout } from '../'
import { SearchForm } from '../form'

import './results.css'

export const Results = () => {
  const { isLoadingVariableResults, isLoadingConcepts, error, layout } = useHelxSearch()
  return (
    <Fragment>
      { layout === SearchLayout.EXPANDED_RESULT ? (
        <ExpandedResultsLayout />
      ) : layout === SearchLayout.GRID ? (
        <ConceptsGridLayout />
      ) : layout === SearchLayout.VARIABLE_VIEW ? (
        <VariableViewLayout />
      ) : null }
    </Fragment>
  )
}
