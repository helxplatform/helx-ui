import { Fragment, useEffect } from 'react'
import { HelxSearch, SearchForm, Results, useHelxSearch } from '../components/search'
import { Typography } from 'antd'
import { Breadcrumbs } from '../components/layout'
import { useEnvironment } from '../contexts'
import { withView } from './'

const { Title } = Typography

export const SearchView = withView(({ setTitle }) => (
  <HelxSearch>
    <ScopedSearchView setTitle={ setTitle } />
  </HelxSearch>
), { title: "" })

const ScopedSearchView = ({ setTitle }) => {
  const { context } = useEnvironment();
  const { query } = useHelxSearch()

  const breadcrumbs = [
    { text: 'Home', path: '/helx' },
    { text: 'Search', path: '/search' },
  ]

  // We need to override the withView setTitle since we have dynamic needs here.
  setTitle(query ? ["Search", query] : "")

  return (
    <Fragment>

      {context.workspaces_enabled === 'true' && <Breadcrumbs crumbs={breadcrumbs} />}

      {context.workspaces_enabled === 'true' && <Title level={1}>Search</Title>}

      <Results />

    </Fragment>
  )
}