import { Fragment } from 'react'
import { Collapse, Typography } from 'antd'
import Highlighter from 'react-highlight-words'
import { Link } from '../../../../link'
import { StudyVariables } from './study-variables'
import { StudyVariable } from './study-variable'
import { useAnalytics } from '../../../../../contexts'

const { Text, Paragraph } = Typography
const { Panel } = Collapse

export const Study = ({ study, highlight, collapsed, ...panelProps }) => {
    const { analyticsEvents } = useAnalytics()
    const studyLinkClicked = () => {
      analyticsEvents.studyLinkClicked(study.c_id)
    }
    const highlightedVariables = study.elements.filter((variable) => {
      return highlight.some((token) => (
        variable.name.includes(token) ||
        variable.description.includes(token)
      ))
    })
    return (
      <Fragment>
        <Panel
          header={
            <Text>
              <Highlighter autoEscape={ true } searchWords={ highlight } textToHighlight={ study.c_name } />{ ` ` }
              (<Link to={ study.c_link } onClick={ studyLinkClicked }>{ study.c_id }</Link>)
            </Text>
          }
          extra={ <Text style={{ whiteSpace: "nowrap" }}>{ study.elements.length } variable{ study.elements.length === 1 ? '' : 's' }</Text> }
          {...panelProps}
        >
          <StudyVariables variables={ study.elements } highlight={ highlight } />
        </Panel>
        { collapsed && highlightedVariables.length > 0 && (
          <div className="study-variables-list" style={{ marginLeft: "16px" }}>
            <Paragraph style={{ marginLeft: "2px", color: "", fontWeight: 500 }} type="secondary">
                Showing {highlightedVariables.length} highlighted {"variable" + (highlightedVariables.length > 1 ? "s" : "")} from search
            </Paragraph>
            {
              highlightedVariables.map((variable) => (
                <StudyVariable
                  key={ variable.id }
                  variable={ variable }
                  highlight={ highlight }
                />
            ))}
          </div>
        )}
      </Fragment>
    )
  }