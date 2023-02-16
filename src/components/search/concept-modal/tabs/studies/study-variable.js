import { Typography } from 'antd'
import Highlighter from 'react-highlight-words'

const { Text } = Typography

export const StudyVariable = ({ variable, highlight, ...props }) => (
    <div className="study-variables-list-item" {...props}>
      <Text className="variable-name">
      <Highlighter searchWords={ highlight } textToHighlight={ variable.name } /> &nbsp;
        ({ variable.e_link ? <a href={ variable.e_link }>{ variable.id }</a> : variable.id })
      </Text><br />
      <Text className="variable-description">
        <Highlighter searchWords={ highlight } textToHighlight={ variable.description } />
      </Text>
    </div>
  )