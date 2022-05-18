import { Fragment } from 'react'
import { Space, Spin, Typography } from 'antd'
import { ArrowRightOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { ResultsHeader } from '..'
import { ConceptCard, PaginationTray, SearchForm, useHelxSearch } from "../.."
import classNames from 'classnames'
import "./expanded-results-sidebar.css"


const { Title, Link } = Typography

export const ExpandedResultsSidebar = ({ expanded, setExpanded }) => {
    const {
        concepts, selectedResult, setSelectedResult,
        pageCount, isLoadingConcepts, setLayout
    } = useHelxSearch()

    return (
        <Space direction="vertical" className={classNames("results results-sidebar", expanded ? "expanded" : "minimized")}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                {/* {expanded && <SearchForm type="minimal" style={{ marginRight: "16px" }}/>} */}
                {/* <Title level={4} style={{ fontWeight: "normal", margin: "0 auto" }}>Search results</Title> */}
                <Link type="secondary">
                    {
                        expanded ? (
                            <LeftOutlined onClick={ () => setExpanded(false) } style={{ fontSize: "16px" }} />
                            ) : (
                            <RightOutlined onClick={ () => setExpanded(true) } style={{ fontSize: "16px" }}/>
                        )
                    }
                </Link>
            </div>
            {/* {expanded && <ResultsHeader />} */}
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
                <div className="results-list grid" style={{ whiteSpace: "normal" }}>
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
    )
}