import { Fragment } from 'react'
import { ConceptSearchResults } from './concept-search-results'
import { useHelxSearch, SearchForm } from '../../'

export const ConceptsGridLayout = () => {
    return (
        <Fragment>
            <SearchForm />
            <ConceptSearchResults />
        </Fragment>
    )
}