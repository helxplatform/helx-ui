import { Fragment, useEffect } from 'react'
import { Typography } from 'antd'
import { withView } from './'

const { Title, Paragraph } = Typography

export const NotAuthorizedView = withView(() => {
  return (
    <Fragment>
      <Title level={ 1 }>ERROR 401</Title>
      <Paragraph type="secondary" style={{ fontSize: 16 }}>You do not have permission to view this page</Paragraph>
    </Fragment>
  )
}, { title: "Not Authorized" })