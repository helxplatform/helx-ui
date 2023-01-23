import { Fragment, useEffect } from 'react'
import { HelxSearch, SearchForm, Results, useHelxSearch } from '../components/search'
import { Typography } from 'antd'
import { Breadcrumbs } from '../components/layout'
import { useEnvironment } from '../contexts'

const { Title } = Typography

export const SearchView = () => (
  <HelxSearch>
    <ScopedSearchView />
  </HelxSearch>
)

const ScopedSearchView = () => {
  const { context } = useEnvironment();
  const { query } = useHelxSearch()

  const breadcrumbs = [
    { text: 'Home', path: '/helx' },
    { text: 'Search', path: '/search' },
  ]

  useEffect(() => {
    if (query) {
      document.title = `Search · ${query} · HeLx UI`
    } else {
      document.title = `HeLx UI`
    }
  }, [query])

  return (
    <Fragment>

      {context.workspaces_enabled === 'true' && <Breadcrumbs crumbs={breadcrumbs} />}

      {context.workspaces_enabled === 'true' && <Title level={1}>Search</Title>}

      <Results />

    </Fragment>
  )
}
