import { Fragment } from 'react'
import { Typography } from 'antd'
import { Breadcrumbs } from '../components/layout'

const { Title } = Typography

export const ContactView = () => {
  const breadcrumbs = [
    { text: 'Home', path: '/' },
    { text: 'Contact', path: '/contact' },
  ]

  return (
    <Fragment>
      <Breadcrumbs crumbs={ breadcrumbs } />
      <Title level={ 1 }>Contact</Title>
      ...
    </Fragment>
  )
}