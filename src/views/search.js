import { Fragment } from 'react'
import { HelxSearch, SearchForm, SearchResults } from '../components/search'
import { Typography } from 'antd'
import { Breadcrumbs } from '../components/layout'
import { useEnvironment } from '../contexts'

const { Title } = Typography

export const SearchView = () => {
  const { context } = useEnvironment();

  const breadcrumbs = [
    { text: 'Home', path: '/helx' },
    { text: 'Search', path: '/search' },
  ]

  return (
    <Fragment>

      {context.env.REACT_APP_WORKSPACES_ENABLED === 'true' && <Breadcrumbs crumbs={breadcrumbs} />}

      {context.env.REACT_APP_WORKSPACES_ENABLED === 'true' && <Title level={1}>Search</Title>}

      <HelxSearch>
        <SearchForm />
        <SearchResults />
      </HelxSearch>

    </Fragment>
  )
}
