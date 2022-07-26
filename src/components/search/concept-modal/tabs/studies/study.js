import { Fragment } from 'react'
import { Collapse, Space, Typography } from 'antd'
import Highlighter from 'react-highlight-words'
import { AddToCartDropdownButton, AddToCartIconButton } from 'antd-shopping-cart'
import { StudyVariables } from './study-variables'
import { StudyVariable } from './study-variable'
import { useShoppingCartUtilities } from '../../../../../hooks'
import { Link } from '../../../../link'

const { Text, Paragraph } = Typography
const { Panel } = Collapse

export const Study = ({ concept, study, highlight, collapsed, ...panelProps }) => {
    const { createStudyCartItem } = useShoppingCartUtilities()
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
              <Highlighter searchWords={ highlight } textToHighlight={ study.c_name } />{ ` ` }
              (<Link to={ study.c_link }>{ study.c_id }</Link>)
            </Text>
          }
          extra={
            <Space>
              <Text>{ study.elements.length } variable{ study.elements.length === 1 ? '' : 's' }</Text>
              <AddToCartIconButton
                item={ createStudyCartItem(study, concept) }
                style={{ marginLeft: 8 }}
              />
            </Space>
          }
          {...panelProps}
        >
          <StudyVariables variables={ study.elements } highlight={ highlight } />
          <Space style={{ marginTop: 4, marginLeft: 4 }}>
            <AddToCartDropdownButton
              item={ createStudyCartItem(study, concept) }
            />
          </Space>
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
                  study={ study }
                  variable={ variable }
                  highlight={ highlight }
                />
            ))}
          </div>
        )}
      </Fragment>
    )
  }