import { List } from 'antd'
import { StudyVariable } from './study-variable'

export const StudyVariables = ({ variables, highlight }) => {
    return (
      <List
        className="study-variables-list"
        dataSource={ variables }
        renderItem={ variable => (
          <StudyVariable variable={ variable } highlight={ highlight } />
        ) }
      />
    )
  }