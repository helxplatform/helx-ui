import { Fragment, useCallback, useState } from 'react'
import { Divider, Space, Tooltip, Typography } from 'antd'
import _Highlighter from 'react-highlight-words'
import { VariableListItem } from './variable-list-item'
import { StudyResult, useVariableView } from '../variable-view-context'
import { useAnalytics } from '../../../../../contexts'
import { SideCollapse } from '../../../../side-collapse'

const { Text } = Typography

interface StudyListItemProps {
    study: StudyResult
}

export const StudyListItem = ({ study }: StudyListItemProps) => {
    const { analyticsEvents } = useAnalytics()
    const { dataSources, highlightTokens } = useVariableView()!

    const [collapsed, setCollapsed] = useState<boolean>(true)

    const Highlighter = useCallback(({ ...props }) => (
        <_Highlighter autoEscape={ true } searchWords={ highlightTokens } {...props} />
    ), [highlightTokens])

    return (
        <SideCollapse
            collapsed={ collapsed }
            onCollapse={ (collapsed) => {
                analyticsEvents.variableViewStudyToggled(study.c_name, !collapsed)
                setCollapsed(collapsed)
            } }
            header={
                <span className="study-panel-header" style={{
                    display: "inline",
                    wordBreak: "break-word"
                }}>
                    <Tooltip title={ study.data_source } placement="right" >
                        <div style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: dataSources[study.data_source].color,
                            marginRight: 8
                        }} />
                    </Tooltip>
                    <Text>
                        <Highlighter textToHighlight={ study.c_name } />
                        &nbsp;
                    </Text>
                    ({ study.c_link ? (
                        <a
                            href={ study.c_link }
                            target="_blank"
                            rel="noreferrer"
                            onClick={ (e) => {
                                e.stopPropagation()
                            } }
                        >
                            { study.c_id }
                        </a>
                    ) : study.c_id })
                </span>
            }
            panelProps={{
                className: "study-panel",
                extra: [
                    <Text key={`text_${study.c_name}`} style={{
                        overflow: "none",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        marginLeft: 8
                    }}>
                        {study.elements.length} variable{study.elements.length === 1 ? '' : 's'}
                    </Text>,
                ]
            }}
        >
            <Space direction="vertical">
                { study.elements.map((variable, i) => (
                    <Fragment key={ variable.id }>
                        <VariableListItem
                            variable={ variable }
                            showStudySource={ false }
                            showDataSource={ false }
                        />
                        { i !== study.elements.length - 1 && <Divider style={{ margin: "2px 0" }} /> }
                    </Fragment>
                )) }
            </Space>
        </SideCollapse>
    )
}