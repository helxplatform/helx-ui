import { Fragment } from 'react'
import { Typography } from 'antd'
import { Breadcrumbs } from '../components/layout'

const { Title } = Typography

export const SupportView = () => {
  const breadcrumbs = [
    { text: 'Home', path: '/helx' },
    { text: 'Support', path: '/support' },
  ]

  return (
    <Fragment>
      <Breadcrumbs crumbs={breadcrumbs} />
      <Title level={1}>Documentation</Title>
      <Typography>Our documentation is designed to help guide you through your first steps with HeLx. We encourage you to get started with these introductory guides</Typography>
      <ul>
        <li><a href="https://helx.gitbook.io/helx-documentation/helx/starting-an-existing-app" target="_blank" rel="noopener noreferrer"><b>Logging in and starting an app</b></a> - Authentication requires a <a href="https://github.com/" target="_blank" rel="noopener noreferrer"><b>Github</b></a> or <a href="https://accounts.google.com/SignUp?hl=en" target="_blank" rel="noopener noreferrer"><b>Google</b></a> account</li>
        <li><a href="https://helx.gitbook.io/helx-documentation/helx/application-management" target="_blank" rel="noopener noreferrer"><b>Managing your apps</b></a> - Learn how to change GPU and CPU resources, rename an app instance, and delete your running apps</li>
        <li><a href="https://helx.gitbook.io/helx-documentation/dug/using-search" target="_blank" rel="noopener noreferrer"><b>Using search</b></a> - Familiarize yourself with Dug, the HeLx search space</li>
        <li><a href="https://helx.gitbook.io/helx-documentation/dug/technical-documents" target="_blank" rel="noopener noreferrer"><b>More technical documentation</b></a> - Dive deeper into the HeLx platform and the underlying architecture</li>
      </ul>
    </Fragment>
  )
}