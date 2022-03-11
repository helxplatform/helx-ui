import { Fragment } from 'react'
import { Typography } from 'antd'

const { Title } = Typography

export const NotFoundView = () => {
  return (
    <Fragment>
      <Title level={ 1 }>ERROR 404</Title>
    </Fragment>
  )
}