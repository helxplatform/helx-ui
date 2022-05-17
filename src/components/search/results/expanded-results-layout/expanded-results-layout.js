import { Fragment, useEffect, useState } from 'react'
import { Space, Divider, Menu, List, Typography, Card, Button, Spin, Empty } from 'antd'
import { ArrowRightOutlined, ArrowLeftOutlined, LeftOutlined, RightOutlined, ShrinkOutlined, CloseOutlined } from '@ant-design/icons'
import { ResultsHeader } from '..'
import { ConceptCard, ConceptModalBody, PaginationTray, SearchForm, SearchLayout, useHelxSearch } from '../..'
import { OverviewTab } from '../../concept-card/overview-tab'
import './expanded-results-layout.css'
import classNames from 'classnames'

const { Text, Paragraph, Title, Link } = Typography

export const ExpandedResultsLayout = () => {
    const {
        concepts, selectedResult, setSelectedResult,
        pageCount, isLoadingConcepts, setLayout
    } = useHelxSearch()

    const [expanded, setExpanded] = useState(true)
    const [doCloseFullscreen, setDoCloseFullscreen] = useState(null)

    // useEffect(() => {
    //     if (concepts.length > 0 && selectedResult === null) setSelectedResult(concepts[0])
    // }, [concepts])
    useEffect(() => {
        if (selectedResult !== null) {
            // Indicates a "redirect" to this layout with an active result already selected.
            setExpanded(false)
        }
    }, [])

    useEffect(() => {
        if (doCloseFullscreen) {
            setSelectedResult(doCloseFullscreen)
            setDoCloseFullscreen(null)
        }
    }, [doCloseFullscreen])

    const closeFullscreen = () => {
        setDoCloseFullscreen(selectedResult)
        setLayout(SearchLayout.DEFAULT)
    }

    const closeSelected = () => {
        setSelectedResult(null)
        setExpanded(true)
    }

    return (
        <div className="expanded-results-layout">
            <Space direction="vertical" className="results results-sidebar">
                <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                    <Link type="secondary">
                        {
                            expanded ? (
                                <LeftOutlined onClick={ () => setExpanded(false) } style={{ fontSize: "16px" }} />
                                ) : (
                                <RightOutlined onClick={ () => setExpanded(true) } style={{ fontSize: "16px" }}/>
                            )
                        }
                    </Link>
                    {expanded && <SearchForm type="minimal" style={{ marginLeft: "16px" }}/>}
                </div>
                {expanded && <ResultsHeader />}
                {/* <List
                    loading={isLoadingConcepts}
                    dataSource={concepts}
                    renderItem={(result) => (
                        <List.Item
                            key={result.id}
                            onClick={() => setSelectedResult(result)}
                            className={"expanded-result-option" + (result.id === selectedResult?.id ? " selected" : "")}
                            style={{ backgroundColor: "", padding: "12px 24px" }}
                        >
                            {result.name}
                        </List.Item>
                    )}
                    style={{ display: concepts.length === 0 ? "none" : undefined }}
                /> */}
                <Spin spinning={isLoadingConcepts}>
                    <div className="results-list grid" style={{ whiteSpace: "normal", display: !expanded ? "none" : undefined }}>
                        {
                            concepts.map((result, i) => (
                                // <Card
                                //     hoverable
                                //     title={`${result.name} (${result.type})`}
                                //     onClick={() => setSelectedResult(result)}
                                //     className={"expanded-result-option-card" + (result.id === selectedResult?.id ? " selected" : "")}
                                // >
                                //     <Paragraph type="secondary" style={{ whiteSpace: "normal" }}>
                                //         {result.description}
                                //     </Paragraph>
                                //     <Divider/>
                                //     <Button
                                //         size="middle"
                                //         type="primary"
                                //         disabled={result.id === selectedResult?.id}
                                //         onClick={() => setSelectedResult(result)}
                                //         style={{ float: "right" }}
                                //     >
                                //         View
                                //     </Button>
                                // </Card>
                                <ConceptCard
                                    key={result.id}
                                    className={classNames("expanded-result-option-concept-card", result.id === selectedResult?.id && "selected")}
                                    result={result}
                                    icon={result.id === selectedResult?.id ? Fragment : ArrowRightOutlined}
                                    openModalHandler={ () => setSelectedResult(result) }
                                />
                            ))
                        }
                    </div>
                </Spin>
                { expanded && pageCount > 1 && <div style={{ marginTop: "8px" }}><PaginationTray showTotal={false} /></div> }
            </Space>
            <Divider type="vertical" style={{ height: "auto", marginLeft: "24px", marginRight: "24px" }}/>
            {selectedResult ? (
                <Card
                    className="expanded-result-container"
                    title={ `${ selectedResult.name } (${ selectedResult.type })` }
                    extra={[
                        <Button icon={ <CloseOutlined /> } type="text" onClick={ closeSelected } />
                    ]}
                >
                    <ConceptModalBody result={ selectedResult } />
                </Card>
            ) : (
                    <div className="" style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Empty />
                    </div>
            )}
        </div>
    )
}