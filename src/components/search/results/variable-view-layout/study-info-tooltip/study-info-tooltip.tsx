import { ReactNode } from 'react'
import { Divider, Typography } from 'antd'
import { ExportOutlined as ExternalLinkIcon } from '@ant-design/icons'
import { StudyResult, useVariableView } from '../variable-view-context'
import { InfoPopover } from '../../../../info-helpers'

const { Link, Title } = Typography

interface StudyInfoTooltipStatisticProps {
    name: ReactNode
    value: ReactNode
}

interface StudyInfoTooltipProps {
    study: StudyResult
}

export const StudyInfoTooltipStatistic = ({ name, value }: StudyInfoTooltipStatisticProps) => {
    return (
        <div
            className="study-info-tooltip-statistic"
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
                gap: 16
            }}>
            <span style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.5px",
                color: "#434343",
                textTransform: "uppercase",
                overflow: "hidden"
            }}>{ name }</span>
            <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{ value }</span>
        </div>
    )
}

export const StudyInfoTooltip = ({ study }: StudyInfoTooltipProps) => {
    return (
        <InfoPopover
            overlayClassName="study-info-tooltip"
            trigger="hover"
            title={
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    margin: "8px 0",
                    gap: 8,
                    maxWidth: 500,
                }}>
                    <Title level={ 5 } ellipsis title={ study.c_name } style={{
                        margin: 0,
                        fontSize: 12.5,
                        letterSpacing: "0.5px",
                        color: "#434343",
                        textTransform: "uppercase",
                        overflow: "hidden"
                    }}>{ study.c_name }</Title>
                    { study.c_link && (
                        <Link href={ study.c_link } target="_blank">
                            <ExternalLinkIcon />
                        </Link>
                    ) }
                </div>
            }
            content={
                <div>
                    <StudyInfoTooltipStatistic name="Identifier" value={ study.c_id } />
                    <Divider style={{ margin: "8px 0" }} />
                    <StudyInfoTooltipStatistic name="Variables" value={ study.elements.length } />
                    <Divider style={{ margin: "8px 0" }} />
                    <StudyInfoTooltipStatistic name="Source" value={ study.data_source } />
                </div>
            }
            color="white"
            style={{ width: "auto", height: "auto", minWidth: 0, minHeight: 0 }}
            iconProps={{ filled: false, style: { fontSize: 12, marginLeft: 1 } }}
            placement="right"
        />
    )
}