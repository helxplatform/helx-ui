import React from 'react'
import { Button, Card, Col, Row, Typography } from 'antd'
import { useEnvironment } from '../../../../contexts'
import { ArrowRightOutlined as CtaIcon } from '@ant-design/icons'

import './results-cta.css'

export const ResultsCTA = () => {
  const { context } = useEnvironment()

  return (
    <Card className="cta-card">
      <Row>
        <Col className="text-container" xl={ 18 } lg={ 18 } md={ 18 } sm={ 24 } xs={ 24 }>
          <Typography>{ context['results-cta'].text }</Typography>
        </Col>
        <Col className="button-container" xl={ 6 } lg={ 6 } md={ 6 } sm={ 24 } xs={ 24 }>
          <Button
            type="primary"
            shape="round"
            icon={ <CtaIcon /> }
            href={ context['results-cta'].action.url }
          >{ context['results-cta'].action.label }</Button>
        </Col>
      </Row>          
    </Card>
  )
}
