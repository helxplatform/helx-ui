import { Fragment, useEffect } from 'react'
import { Typography } from 'antd'

const { Title, Paragraph } = Typography

export const NotAuthorizedView = () => {
  useEffect(() => {
    document.title = `Not Authorized · HeLx UI`
  }, [])
  return (
    <Fragment>
      <Title level={ 1 }>ERROR 401</Title>
      <Paragraph type="secondary" style={{ fontSize: 16 }}>You do not have permission to view this page</Paragraph>
    </Fragment>
  )
}