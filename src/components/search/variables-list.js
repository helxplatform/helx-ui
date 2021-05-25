import React from 'react'
import { List } from 'antd'
import { Link } from '../link'

export const VariablesList = ({ studyId, variables }) => {
  return (
    <List
      header="Variables"
      dataSource={ variables }
      renderItem={ variable => (
        <List.Item key={variable.id}>
          <Link to={variable.e_link}>{variable.id}: {variable.id}</Link>
        </List.Item>
      )}
    />
  )
}