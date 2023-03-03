import { Fragment, useEffect } from 'react'
import { Button, Result, Typography } from 'antd'
import { useNavigate } from '@gatsbyjs/reach-router'
import { useEnvironment } from '../contexts'
import { useTitle } from './'

const { Title } = Typography

export const NotFoundView = () => {
  const { basePath } = useEnvironment()
  const navigate = useNavigate()

  useTitle("Not Found")

  return (
    <Fragment>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={ <Button type="primary" onClick={ () => navigate(basePath) }>Home</Button> }
      />
    </Fragment>
  )
}