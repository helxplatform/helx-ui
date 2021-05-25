import { Fragment } from 'react'
import { Typography } from 'antd'
import { Breadcrumbs } from '../components/layout'
import { Link } from '../components/link'

const { Title } = Typography

export const DocumentationView = () => {
  const breadcrumbs = [
    { text: 'Home', path: '/' },
    { text: 'Documentation', path: '/documentation' },
  ]

  return (
    <Fragment>
      <Breadcrumbs crumbs={ breadcrumbs } />

      <Title level={ 1 }>Documentation</Title>

      <Link to="https://helx.gitbook.io/helx-documentation/">Docs</Link>
    </Fragment>
  )
}