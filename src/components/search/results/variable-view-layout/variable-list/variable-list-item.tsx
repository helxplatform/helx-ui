import { useCallback, useMemo, useRef, useState } from 'react'
import { Button, Tooltip, Typography } from 'antd'
import _Highlighter from 'react-highlight-words'
import { useVariableView, VariableResult } from '../variable-view-context'
import classNames from 'classnames'
import { StudyInfoTooltip } from '../study-info-tooltip'

const { Text } = Typography

const VARIABLE_DESCRIPTION_CUTOFF = 500

interface VariableListItemProps extends React.HTMLProps<HTMLDivElement> {
    variable: VariableResult
    showStudySource?: boolean
    showDataSource?: boolean
}

export const VariableListItem = ({ variable, showStudySource=true, showDataSource=true, style={}, ...props }: VariableListItemProps) => {
    const { dataSources, highlightTokens, getStudyById } = useVariableView()!
    
    const [showMore, setShowMore] = useState<boolean>(false)
    
    const descriptionRef = useRef<HTMLSpanElement>(null)
    
    const displayShowMore = useMemo(() => variable.description.length > VARIABLE_DESCRIPTION_CUTOFF, [variable])

    const Highlighter = useCallback(({ ...props }) => (
        <_Highlighter autoEscape={ true } searchWords={ highlightTokens } {...props} />
    ), [highlightTokens])

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                flexWrap: "nowrap",
                paddingRight: 16,
                ...style
            }}
            { ...props }
        >
            <span
                className="study-panel-header"
                style={{
                    flex: "auto",
                    display: "inline-flex",
                    alignItems: "center"
                }}
            >
                { showDataSource && (
                    <Tooltip title={ variable.data_source } placement="right" >
                        <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: dataSources[variable.data_source].color,
                            marginRight: 8
                        }} />
                    </Tooltip>
                ) }
                <Text>
                    <Highlighter textToHighlight={ variable.name } />
                    &nbsp;
                </Text>
                ({ variable.e_link ? (
                    <a
                        href={variable.e_link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={ (e) => {
                            e.stopPropagation()
                        } }
                    >
                        {variable.id}
                    </a>
                ) : variable.id })
            </span>
            <span className={ classNames("variable-list-item-description" ) } ref={ descriptionRef }>
                <Highlighter textToHighlight={ displayShowMore && !showMore 
                    ? variable.description.slice(0, VARIABLE_DESCRIPTION_CUTOFF) + "..."
                    : variable.description
                } />
                { displayShowMore && (
                    <Button
                        type="link"
                        size="small"
                        style={{ padding: 0, fontSize: 13, marginLeft: 8 }}
                        onClick={ () => setShowMore(!showMore) }
                    >
                        { showMore ? "Show less" : "Show more" }
                    </Button>
                ) }
            </span>
            { showStudySource && (
                <span style={{ display: "inline-flex", alignItems: "center", fontSize: 12, color: "rgba(0, 0, 0, 0.45)" }}>
                    Source:&nbsp;<i>
                        <Highlighter textToHighlight={ variable.study_name } />
                    </i>&nbsp;
                    <StudyInfoTooltip study={ getStudyById(variable.study_id)! } />
                </span>
            ) }
        </div>
    )
}