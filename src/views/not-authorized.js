import { Fragment, useEffect } from 'react'
import { Typography } from 'antd'
import { useTitle } from './'

const { Title, Paragraph } = Typography

export const NotAuthorizedView = () => {
  useTitle("Not Authorized")

  return (
    <Fragment>
      <Title level={ 1 }>ERROR 401</Title>
      <Paragraph type="secondary" style={{ fontSize: 16 }}>You do not have permission to view this page</Paragraph>
    </Fragment>
  )
}