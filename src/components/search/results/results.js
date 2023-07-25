import React, { Fragment } from 'react'
import { ExpandedResultsLayout, ConceptsGridLayout, VariableViewLayout } from './'
import { useHelxSearch, SearchLayout } from '../'
import { ResultsCTA } from './results-cta'

import './results.css'

export const Results = () => {
  const { isLoadingConcepts, layout } = useHelxSearch()

  return (
    <Fragment>
      {
        // Todo: determine proper condition to render this CTA
        !isLoadingConcepts && <ResultsCTA /> }

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
