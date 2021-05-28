import { Fragment } from 'react'
import { Layout, Typography } from 'antd'
import { Breadcrumbs } from '../components/layout'

const { Title } = Typography

export const SupportView = () => {
  const breadcrumbs = [
    { text: 'Home', path: '/helx' },
    { text: 'Help', path: '/help' },
  ]

  return (
    <Fragment>
      <Breadcrumbs crumbs={breadcrumbs} />
      <Title level={1}>Get in touch</Title>
        <Typography>For support or any help, please reach out to helx@lists.renci.org.</Typography>
        <Title level={1}>Documentation</Title>
        <Typography>Learn more, take a look at our <a href="https://helx.gitbook.io/helx-documentation/" target="_blank">docs</a>.</Typography>
    </Fragment>
  )
}