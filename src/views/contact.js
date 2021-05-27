import { Fragment } from 'react'
import { Layout, Typography } from 'antd'
import { Breadcrumbs } from '../components/layout'

const { Title } = Typography

export const ContactView = () => {
  const breadcrumbs = [
    { text: 'Home', path: '/helx' },
    { text: 'Contact', path: '/contact' },
  ]

  return (
    <Fragment>
      <Breadcrumbs crumbs={breadcrumbs} />
      <Title level={1}>Get in touch</Title>
        <Typography>For support or any help, please reach out to helx@lists.renci.org.</Typography>
    </Fragment>
  )
}