import { useEffect, useState } from 'react'
import { Collapse, List, Space, Tag, Typography } from 'antd'
import { Link } from '../../link'

const { Text, Title } = Typography
const { CheckableTag: CheckableFacet } = Tag
const { Panel } = Collapse

export const CdesTab = ({ cdes }) => {
  return (
    <Space direction="vertical">
      <Title level={ 4 }>CDEs</Title>
   </Space>
  )
}
