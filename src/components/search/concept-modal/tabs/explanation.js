import { useMemo, useRef, useState } from 'react'
import { Button, Checkbox, Divider, Progress, Space, Switch, Typography } from 'antd'
import { presetPalettes } from '@ant-design/colors'
import { Pie } from '@ant-design/plots'
import { InfoTooltip } from '../../..'

const { Title, Text } = Typography

// Show the first 6 score components, unless show more is pressed.
const SHOW_MORE_CUTOFF = 6

const palette = [
    presetPalettes.blue,
    presetPalettes.gold,
    presetPalettes.green,
    presetPalettes.purple,
    presetPalettes.volcano,
    presetPalettes.cyan,
    presetPalettes.magenta,
    presetPalettes.yellow,
    presetPalettes.red,
    presetPalettes.lime,
    presetPalettes.geekblue
].map((palette) => palette[5])

const parseScoreDetail = ({ value, description, details }) => {
    if (value === 0) return null
    // For "sum of:", relevant details contribute their own scores to a final aggregate value.
    // (e.g., in a relevance scoring for a term over two search fields, perhaps name and description, maybe the name detail
    // has score 5.2 and the description detail has score 3.3, then the aggregate score 8.5 will be used.)
    if (description === "sum of:") {
        return details.flatMap((detail) => parseScoreDetail(detail))
    }
    // For "max of:", only the detail with maximum score is used to compute the score.
    // (e.g., in a relevance scoring for a term over two search fields, perhaps name and description, maybe the name detail
    // has score 5.2 and the description detail has score 3.3, then the score of 5.2 will be used.)
    if (description === "max of:") {
        const maximalDetail = details.reduce((acc, cur) => cur.value > acc.value ? cur : acc, details[0])
        return [parseScoreDetail(maximalDetail)]
    }

    const explainPattern = /^weight\((?<fieldName>.+):(?<searchTerm>.+) in (?<segmentNumber>\d+)\) \[(?<similarityMetric>.+)\], result of:$/
    const match = description.match(explainPattern)
    if (match) {
        let { fieldName, searchTerm, segmentNumber, similarityMetric } = match.groups
        if (searchTerm.startsWith(`"`) && searchTerm.endsWith(`"`)) searchTerm = searchTerm.slice(1, -1)
        return {
            fieldMatch: fieldName,
            termMatch: searchTerm,
            source: description,
            value
        }
    } else {
        console.log("Failed to parse score explanation:", description)
        return {
            fieldMatch: null,
            termMatch: null,
            source: description,
            value
        }
    }
}

export const ExplanationTab = ({ result }) => {
    const { explanation } = result
    
    const [showMore, setShowMore] = useState(false)
    const [advancedBreakdown, setAdvancedBreakdown] = useState(false)
    const pieRef = useRef()
    const totalScore = useMemo(() => explanation.value, [explanation.value])
    const scoreData = useMemo(() => (parseScoreDetail(explanation)
        .filter((detail) => detail !== null)
        // Reduce duplicate details into single details.
        .reduce((acc, cur) => {
            const existingDetail = acc.find((detail) => detail.source === cur.source)
            if (!existingDetail) acc.push(cur)
            else {
                // If the exact detail already exists, add the scores.
                existingDetail.value += cur.value
            }
            return acc
        }, [])
        // Reduce details down further into single field matches, if advanced breakdown is disabled.
        // E.g. `name:heart` and `name:heart disease` would get merged into the same detail at this step.
        .reduce((acc, cur) => {
            if (advancedBreakdown) {
                acc.push(cur)
                return acc
            }
            const existingDetailWithField = acc.find((detail) => detail.fieldMatch === cur.fieldMatch)
            if (!existingDetailWithField) acc.push(cur)
            else {
                // If a detail exists with the current field match, and not in advanced breakdown, add the scores.
                if (Array.isArray(existingDetailWithField.termMatch)) existingDetailWithField.termMatch.push(cur.termMatch)
                else existingDetailWithField.termMatch = [existingDetailWithField.termMatch, cur.termMatch]
                existingDetailWithField.value += cur.value
            }
            return acc
        }, [])
        // Reduce details into chart data
        .reduce((acc, cur) => {
            const { fieldMatch, termMatch, source, value } = cur
            const [fieldMatchName, fieldMatchDescription] = (
                  fieldMatch ===        "name"    ? ["Concept Name", "Contribution to the score because the search query matched this concept's name"]
                : fieldMatch === "description"    ? ["Description", "Contribution to the score because we found the search query in this concept's description"]
                : fieldMatch === "search_terms"   ? ["Synonyms", "Contribution to the score because we found the search query in this concept's synonymns"]
                : fieldMatch === "optional_terms" ? ["Related terms", "Contribution to the score because we found the search query among this concept's semantically related terms"]
                : ["", ""]
            )
            const advancedBreakdownString = `term "${ termMatch }"`
            if (fieldMatch && termMatch) acc.push({
                name: `${ fieldMatchName }`,
                description: advancedBreakdown ? `${ fieldMatchDescription.replace("query", advancedBreakdownString) }` : `${fieldMatchDescription}`,
                key: source,
                matchedField: fieldMatch,
                matchedTerms: termMatch,
                failedParse: false,
                value
            })
            else acc.push({
                name: "Unknown",
                description: "Could not parse explanation for this score component.",
                key: source,
                matchedField: null,
                matchedTerms: null,
                failedParse: true,
                value
            })
            return acc
        }, [])
        .sort((a, b) => b.value - a.value)
    ), [explanation, advancedBreakdown])
    const colorMap = useMemo(() => palette.slice(0, scoreData.length), [scoreData])
    const pieConfig = useMemo(() => ({
        data: scoreData,
        // appendPadding: 10,
        autoFit: false,
        height: 310,
        width: 400,
        angleField: "value",
        colorField: "key",
        radius: 1,
        innerRadius: 0.70,
        renderer: "svg",
        legend: false,
        statistic: {
            title: {
                style: {
                    fontSize: "1em"
                }
            },
            content: {
                offsetY: 4,
                content: explanation.value.toFixed(1),
                style: {
                    fontSize: "1em"
                }
            }
        },
        label: {
            type: "inner",
            offset: "-50%",
            style: {
                textAlign: "center"
            },
            autoRotate: false,
            formatter: (v) => (v.value/totalScore*100).toFixed(0)+'%'
        },
        tooltip: {
            formatter: (datum) => {
                const { name, value } = scoreData.find((d) => d.key === datum.key)
                return { name, value }
            }
        },
        color: colorMap
    }), [scoreData, colorMap, explanation])
    return (
        <Space direction="vertical" size={ 8 }>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <Text style={{
                        fontSize: 15,
                        fontWeight: 500
                    }}>
                        Explanation for this concept&apos;s relation to search term
                    </Text>
                    <div>
                        <Text style={{ fontSize: 13 }} italic>What does the total score returned by the search mean?</Text>
                    </div>
                </div>
                <div style={{ display: "flex", flexFlow: "row", alignItems: "center", marginRight: 16 }}>
                    <Checkbox checked={ advancedBreakdown } onChange={ () => setAdvancedBreakdown(!advancedBreakdown) } />
                    <span style={{ color: "rgba(0, 0, 0, 0.45)", fontStyle: "italic", fontSize: 12, marginLeft: 8 }}>Advanced</span>
                </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", paddingRight: 16 }}>
                <Pie ref={ pieRef } { ...pieConfig } />
                <Space direction="vertical" style={{ marginLeft: 16 }} size={ 12 }>
                    {
                        (showMore ? scoreData : scoreData.slice(0, SHOW_MORE_CUTOFF - 1)).map((detail, i) => (
                            <div key={ detail.key } style={{ display: "flex", flexDirection: "column" }}>
                                <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
                                    <span style={{
                                        fontSize: 12,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.25,
                                        fontWeight: 600,
                                        color: "rgba(0, 0, 0, 0.65)",
                                        whiteSpace: "nowrap"
                                    }}>
                                        { detail.name }
                                    </span>
                                    <Progress
                                        className="explanation-score-progress"
                                        strokeColor={ colorMap[i] }
                                        percent={ ((detail.value / totalScore) * 100).toFixed(0) }
                                        // Get rid of annoying style rules at 100%
                                        success={{ percent: 0 }}
                                        title={ detail.value.toFixed(2) }
                                        style={{ marginLeft: 8 }}
                                    />
                                </div>
                                <div style={{
                                    fontSize: 13,
                                    fontStyle: "italic",
                                    display: "inline-flex",
                                    alignItems: "center"
                                }}>
                                    { detail.description }
                                    {/* { !detail.failedParse && (
                                        <InfoTooltip
                                            title={
                                                <div>
                                                    { Array.isArray(detail.matchedTerms) ? detail.matchedTerms.join("/") : detail.matchedTerms }
                                                    &nbsp;matched with&nbsp;
                                                    { result[detail.matchedField] }
                                                </div>
                                            }
                                            placement="bottom"
                                            trigger="hover"
                                            iconProps={{ style: { marginLeft: 6, fontSize: 14, color: "rgba(0, 0, 0, 0.45)" } }}
                                        />
                                    ) } */}
                                </div>
                            </div>
                        ))
                    }
                    { scoreData.length > SHOW_MORE_CUTOFF && (
                        <Button
                            type="link"
                            size="small"
                            style={{ padding: 0 }}
                            onClick={ () => setShowMore(!showMore) }
                        >
                            { showMore ? "Show less" : "Show more" }
                        </Button>
                    ) }
                </Space>
            </div>
        </Space>
    )
}