import { List } from 'antd'
import { StudyVariable } from './study-variable'

export const StudyVariables = ({ study, variables, highlight }) => {
    return (
      <List
        className="study-variables-list"
        dataSource={ variables }
        renderItem={ variable => (
          <StudyVariable study={ study } variable={ variable } highlight={ highlight } />
        ) }
      />
    )
  }