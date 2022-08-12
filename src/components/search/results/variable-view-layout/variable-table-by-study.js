import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Collapse, List, Typography, Button, Space, Divider } from 'antd'
import InfiniteScroll from 'react-infinite-scroll-component';
import {
    PushpinOutlined as UnselectedIcon,
    PushpinFilled as SelectedIcon,
} from '@ant-design/icons'
const { Text } = Typography
const { Panel } = Collapse


export const VariablesTableByStudy = ({studyResultsForDisplay, studyNamesForDisplay, toggleStudyHighlightingInHistogram}) => {
    const VariableList = ({ study }) => {
        return (
            <List
                className="study-variables-list"
                dataSource={study.elements}
                renderItem={variable => (
                    <div className={`study-variables-list-item within-filter-${variable.withinFilter}`}>
                        <Text className="variable-name">
                            {variable.name} &nbsp;
                            ({variable.e_link ? <a href={variable.e_link}>{variable.id}</a> : variable.id})
                        </Text><br />
                        <Text className="variable-description"> {variable.description}</Text>
                    </div>
                )}
            />
        )
    }

    const ScrollableVariableList = ({ study }) => (
        <div
            id="scrollableDiv"
            className="scrollable-div"
        >
            <InfiniteScroll
                dataLength={study.elements.length}
                scrollableTarget="scrollableDiv"
            >
                <VariableList study={study}/>
            </InfiniteScroll>
        </div>
    )

    return (
        <Collapse ghost className="variables-collapse">
            {
                studyResultsForDisplay.map((study, i) => {
                    return (
                        <Panel
                            key={`panel_${study.c_name}_${i}`}
                            className={ [
                                'study-panel ',
                                studyNamesForDisplay.includes(study.c_name) ? 'selected' : 'unselected',
                            ] }
                            header={
                                <span className="study-panel-header">
                                    <Text>{study.c_name}{` `}</Text>
                                    <Button
                                        type="link"
                                        className="study-selection-button"
                                        onClick={ (e) => { e.stopPropagation(); toggleStudyHighlightingInHistogram(study.c_name)} }
                                    >
                                    {
                                        studyNamesForDisplay.includes(study.c_name)
                                            ? <SelectedIcon />
                                            : <UnselectedIcon />
                                    }
                                    </Button> 
                                </span>
                            }
                            extra={ [
                                <Text key={`text_${study.c_name}_${i}`}
                                >{study.elements.length} variable{study.elements.length === 1 ? '' : 's'}</Text>,
                            ] }
                        >
                            {study.elements.length > 7 ? < ScrollableVariableList study={study}/> : < VariableList study={study}/> }
                        </Panel>
                    )
                })
            }
        </Collapse>
    )
}
