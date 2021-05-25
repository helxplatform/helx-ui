import { Fragment } from 'react'
import { HelxSearch, SearchForm, SearchResults } from '../components/search'
import { Typography } from 'antd'
import { Breadcrumbs } from '../components/layout'

const { Title } = Typography

export const SemanticSearchView = () => {
  const breadcrumbs = [
    { text: 'Home', path: '/' },
    { text: 'Semantic Search', path: '/search' },
  ]

  return (
    <Fragment>
      
      <Breadcrumbs crumbs={ breadcrumbs } />

      <Title level={ 1 }>Semantic Search</Title>
      
      <HelxSearch>
        <SearchForm />
        <SearchResults />
      </HelxSearch>

    </Fragment>
  )
}
