import {Button, Typography} from 'antd'
import Highlighter from 'react-highlight-words'
import { useAnalytics } from '../../../../../contexts'
import {ExportOutlined} from "@ant-design/icons";

const { Text } = Typography

export const StudyVariable = ({ variable, highlight, ...props }) => {
  const { analyticsEvents } = useAnalytics()

  const variableLinkClicked = () => {
    analyticsEvents.variableLinkClicked(variable.id)
  }
  return (
      <>
          <div className="study-variables-list-item" {...props}>
              <Text className="variable-name">
                  <Highlighter autoEscape={true} searchWords={highlight} textToHighlight={variable.name}/> &nbsp;
                  ({variable.e_link ?
                  <a href={variable.e_link} onClick={variableLinkClicked}>{variable.id}</a> : variable.id})
              </Text><br/>
              <Text className="variable-description">
                  <Highlighter autoEscape={true} searchWords={highlight} textToHighlight={variable.description}/>
              </Text>
              <ul>
              <li {...props}>
                  Related to CDEs in <em>Tobacco, Alcohol, Prescription medications, and other Substance (TAPS)</em><Button
                  type="text"
                  size="small"
                  icon={
                      <ExportOutlined onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open("https://heal.nih.gov/files/CDEs/2023-05/taps-cdes.xlsx", "_blank")
                      }}/>
                  }
                  style={{marginLeft: "4px"}}
              /></li>
              </ul>
          </div>
      </>
  )
}