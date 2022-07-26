import { Fragment, useEffect } from 'react'
import { Typography } from 'antd'

const { Title } = Typography

export const NotFoundView = () => {
  useEffect(() => {
    document.title = `Not Found · HeLx UI`
  }, [])
  return (
    <Fragment>
      <Title level={ 1 }>ERROR 404</Title>
    </Fragment>
  )
}