import { Typography } from 'antd'
import Highlighter from 'react-highlight-words'
import { useAnalytics } from '../../../../../contexts'

const { Text } = Typography

export const StudyVariable = ({ variable, highlight, ...props }) => {
  const { analyticsEvents } = useAnalytics()

  const variableLinkClicked = () => {
    analyticsEvents.variableLinkClicked(variable.id)
  }
  return (
    <div className="study-variables-list-item" {...props}>
      <Text className="variable-name">
      <Highlighter autoEscape={ true } searchWords={ highlight } textToHighlight={ variable.name } /> &nbsp;
        ({ variable.e_link ? <a href={ variable.e_link } onClick={ variableLinkClicked }>{ variable.id }</a> : variable.id })
      </Text><br />
      <Text className="variable-description">
        <Highlighter autoEscape={ true } searchWords={ highlight } textToHighlight={ variable.description } />
      </Text>
    </div>
  )
}