import { Fragment } from 'react'
import { Typography } from 'antd'
import { Breadcrumbs } from '../components/layout'

const { Title } = Typography

export const WorkspacesView = () => {
  const breadcrumbs = [
    { text: 'Home', path: '/' },
    { text: 'Workspaces', path: '/workspaces' },
  ]
  return (
    <Fragment>
      <Breadcrumbs crumbs={ breadcrumbs } />
      <Title level={ 1 }>Workspaces</Title>
      ...
    </Fragment>
  )
}