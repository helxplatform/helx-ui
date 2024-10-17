import { Fragment } from 'react'
import { Results, useHelxSearch } from '../components/search'
import { Typography } from 'antd'
import { Breadcrumbs } from '../components/layout'
import { useEnvironment } from '../contexts'
import { useTitle } from './'
import { GuidedTourButton } from '../components/guided-tour'

const { Title } = Typography

export const SearchView = () => {
  const { context } = useEnvironment();
  const { query } = useHelxSearch()

  const breadcrumbs = [
    { text: 'Home', path: '/helx' },
    { text: 'Search', path: '/search' },
  ]

  // We need to override the withView useTitle since we have dynamic needs here.
  useTitle(query ? ["Search", query] : "")
  return (
    <Fragment>

      {context.workspaces_enabled === 'true' && <Breadcrumbs crumbs={breadcrumbs} />}

      {context.workspaces_enabled === 'true' && <Title level={1}>Search</Title>}

      { context.brand === "heal" && <GuidedTourButton /> }

      <Results />

    </Fragment>
  )
}