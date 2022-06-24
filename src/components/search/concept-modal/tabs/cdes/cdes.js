import { useEffect, useState, useCallback, useMemo } from 'react'
import { Collapse, Divider, List, Space, Spin, Tag, Typography } from 'antd'
import { ExpandAltOutlined } from '@ant-design/icons'
import { Link } from '../../../../link'
import { useEnvironment } from '../../../../../contexts'
import { CdeItem } from './cde-item'
import './cdes.css'

const { Text, Title } = Typography
const { CheckableTag: CheckableFacet } = Tag
const { Panel } = Collapse

export const CdesTab = ({ cdes, cdeRelatedConcepts }) => {
  const { context } = useEnvironment()
  const loading = useMemo(() => cdes === null || cdeRelatedConcepts === null, [cdes, cdeRelatedConcepts])

  return (
    <Space direction="vertical">
      <Title level={ 4 }>CDEs</Title>
      <List
        loading={loading}
        dataSource={!loading ? cdes.elements : []}
        renderItem={(cde) => (
          <CdeItem cde={ cde } cdeRelatedConcepts={ cdeRelatedConcepts } />
        )}
      />
   </Space>
  )
}
