import { Fragment } from 'react'
import { HelxSearch, SearchForm, SearchResults } from '../components/search'
import { Typography } from 'antd'
import { Breadcrumbs } from '../components/layout'

const { Title } = Typography

export const SearchView = () => {

  const breadcrumbs = [
    { text: 'Home', path: '/helx' },
    { text: 'Search', path: '/search' },
  ]

  return (
    <Fragment>
      
      <Breadcrumbs crumbs={ breadcrumbs } />

      <Title level={ 1 }>Search</Title>
      
      <HelxSearch>
        <SearchForm />
        <SearchResults />
      </HelxSearch>

    </Fragment>
  )
}
