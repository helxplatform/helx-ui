import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Collapse, List, Typography, Button, Space, Divider } from 'antd'
import {
    PushpinOutlined as UnselectedIcon,
    PushpinFilled as SelectedIcon,
} from '@ant-design/icons'
const { Text } = Typography
const { Panel } = Collapse


export const VariablesTableByStudy = useMemo(() => (
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
                                  onClick={ toggleStudyHighlightingInHistogram(study.c_name) }
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
), [studyNamesForDisplay, studyResultsForDisplay])
